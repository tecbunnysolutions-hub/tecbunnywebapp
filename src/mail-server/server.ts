import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables for the standalone process
dotenv.config({ path: '../../.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const server = new SMTPServer({
  secure: false, // In production, use TLS certificates (key/cert)
  authOptional: true, // Allow incoming mail from other MTAs without auth
  
  // Handle incoming message stream
  onData(stream, session, callback) {
    simpleParser(stream, async (err, parsed) => {
      if (err) {
        console.error('Error parsing email:', err);
        return callback(err);
      }

      const fromAddress = Array.isArray(parsed.from) ? parsed.from[0]?.value[0]?.address : parsed.from?.value[0]?.address;
      const toLogAddress = Array.isArray(parsed.to) ? parsed.to[0]?.value[0]?.address : (parsed.to as any)?.text || (parsed.to as any)?.value?.[0]?.address;
      console.log(`Received email from ${fromAddress} to ${toLogAddress}`);

      try {
        // Find if the recipient is one of our webmail accounts
        const recipientEmail = Array.isArray(parsed.to) 
          ? parsed.to[0]?.value[0]?.address 
          : parsed.to?.value[0]?.address;

        if (!recipientEmail) {
          console.log('No recipient found in email');
          return callback();
        }

        const { data: account, error: accountError } = await supabase
          .from('webmail_accounts')
          .select('id, domain_id')
          .eq('email', recipientEmail)
          .single();

        if (accountError || !account) {
          console.log(`Email account ${recipientEmail} not found in system.`);
          // In a real MTA, you might reject this with a 550 error
          return callback();
        }

        // Save email to database
        const { error: insertError } = await supabase
          .from('webmail_messages')
          .insert({
            account_id: account.id,
            folder: 'inbox',
            from_name: parsed.from?.value[0]?.name || null,
            from_address: parsed.from?.value[0]?.address || 'unknown@unknown.com',
            to_address: recipientEmail,
            subject: parsed.subject || 'No Subject',
            body_text: parsed.text || '',
            body_html: parsed.html || '',
            is_read: false,
            message_id: parsed.messageId,
            raw_headers: Object.fromEntries(parsed.headers)
          });

        if (insertError) {
          console.error('Failed to save email to DB:', insertError);
        } else {
          console.log('Successfully saved incoming email to Inbox!');
        }
      } catch (dbErr) {
        console.error('Database exception:', dbErr);
      }

      callback();
    });
  }
});

const PORT = 25;
server.listen(PORT, () => {
  console.log(`Independent SMTP Server listening on port ${PORT}...`);
  console.log('Make sure your VPS firewall and hosting provider allows traffic on port 25.');
});
