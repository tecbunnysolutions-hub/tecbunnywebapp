import { supabase } from '@/lib/supabase';
import { TriagedPayload } from '../agents/InboundTriageAgent';
import { sendWhatsAppMessage } from './infobipService';

type AutomationCondition = {
  field: string;
  operator: string;
  value: string;
};

type AutomationAction = {
  id: string;
  action_type: string;
  action_payload?: {
    text?: string;
    agent_id?: string;
    status?: string;
  };
  execution_order: number;
};

type AutomationRule = {
  name: string;
  match_type: string;
  conditions?: AutomationCondition[];
  actions?: AutomationAction[];
};

export class RuleEngineService {
  static async evaluateRules(payload: TriagedPayload): Promise<boolean> {
    const { data: rules } = await supabase
      .from('waba_automation_rules')
      .select('*, conditions:waba_automation_conditions(*), actions:waba_automation_actions(*)')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (!rules || rules.length === 0) return false;

    for (const rule of rules as AutomationRule[]) {
      if (await this.evaluateConditions(rule.conditions, rule.match_type, payload)) {
        console.log(`[RuleEngine] Rule matched: ${rule.name}`);
        await this.executeActions(rule.actions, payload);
        return true; // Stop processing rules after the first matching rule is executed
      }
    }

    return false;
  }

  private static async evaluateConditions(conditions: AutomationCondition[] | undefined, matchType: string, payload: TriagedPayload): Promise<boolean> {
    if (!conditions || conditions.length === 0) return true;

    const evaluateCondition = (condition: AutomationCondition) => {
      let fieldValue: string | boolean | undefined;

      // Extract field from payload
      switch (condition.field) {
        case 'intent_level':
          fieldValue = payload.intent_level;
          break;
        case 'domain':
          fieldValue = payload.domain;
          break;
        case 'sub_category':
          fieldValue = payload.sub_category;
          break;
        case 'escalate_to_human':
          fieldValue = payload.escalate_to_human;
          break;
        case 'is_actionable':
          fieldValue = payload.is_actionable;
          break;
        case 'message_text':
          fieldValue = payload.history.length > 0 ? payload.history[payload.history.length - 1].message_content : '';
          break;
        default:
          fieldValue = undefined;
      }

      const strFieldValue = String(fieldValue).toLowerCase();
      const strConditionValue = String(condition.value).toLowerCase();

      switch (condition.operator) {
        case 'EQUALS':
          return strFieldValue === strConditionValue;
        case 'CONTAINS':
          return strFieldValue.includes(strConditionValue);
        case 'REGEX':
          try {
            return new RegExp(condition.value, 'i').test(strFieldValue);
          } catch (error) {
            console.warn('[RuleEngine] Invalid regex condition skipped', { value: condition.value, error });
            return false;
          }
        case 'IS_TRUE':
          return fieldValue === true || strFieldValue === 'true';
        case 'IS_FALSE':
          return fieldValue === false || strFieldValue === 'false';
        case 'IN':
          try {
             const arr = JSON.parse(condition.value);
             return Array.isArray(arr) && arr.map((x: unknown) => String(x).toLowerCase()).includes(strFieldValue);
          } catch {
             return false;
          }
        default:
          return false;
      }
    };

    if (matchType === 'ANY') {
      return conditions.some(evaluateCondition);
    } else {
      // Default to 'ALL'
      return conditions.every(evaluateCondition);
    }
  }

  private static async executeActions(actions: AutomationAction[] | undefined, payload: TriagedPayload): Promise<void> {
    if (!actions) return;

    // Sort actions by execution order
    actions.sort((a, b) => a.execution_order - b.execution_order);

    for (const action of actions) {
      try {
        switch (action.action_type) {
          case 'SEND_MESSAGE':
            const text = action.action_payload?.text;
            if (text) {
              await sendWhatsAppMessage(payload.senderNumber, text, null);
              console.log(`[RuleEngine] Action: Sent WhatsApp Message to ${payload.senderNumber}`);
            }
            break;
          case 'ASSIGN_AGENT':
            const agentId = action.action_payload?.agent_id;
            if (agentId) {
              await supabase.from('Conversation').update({ assigned_to: agentId }).eq('sender_number', payload.senderNumber);
              console.log(`[RuleEngine] Action: Assigned ${payload.senderNumber} to agent ${agentId}`);
            }
            break;
          case 'UPDATE_STATUS':
            const status = action.action_payload?.status;
            if (status) {
              await supabase.from('Conversation').update({ status }).eq('sender_number', payload.senderNumber);
              console.log(`[RuleEngine] Action: Updated status for ${payload.senderNumber} to ${status}`);
            }
            break;
          default:
            console.warn(`[RuleEngine] Unknown action type: ${action.action_type}`);
        }
      } catch (err) {
        console.error(`[RuleEngine] Failed to execute action ${action.id}:`, err);
      }
    }
  }
}
