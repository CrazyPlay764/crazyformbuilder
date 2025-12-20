-- Add is_published column to forms table for open/close functionality
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;