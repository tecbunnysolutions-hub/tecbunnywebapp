CREATE TABLE IF NOT EXISTS public.waba_conversation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_number TEXT NOT NULL REFERENCES public."Conversation"(sender_number) ON DELETE CASCADE,
  note TEXT NOT NULL CHECK (char_length(trim(note)) > 0),
  author_id TEXT,
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waba_conversation_notes_sender_created
  ON public.waba_conversation_notes(sender_number, created_at DESC);