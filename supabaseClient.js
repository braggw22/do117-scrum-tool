// supabaseClient.js
//
// This module exports a preconfigured Supabase client for the DO117 scrum tool.
// It reads the Supabase URL and anon key from data attributes on the document
// body (data-supabase-url and data-supabase-anon) so that no secret keys are
// hard‑coded in your JavaScript files.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Grab configuration values from the <body> element.  When deploying your site
// set these attributes to your own Supabase project URL and anon key.  For
// example:
// <body data-supabase-url="https://abcd.supabase.co" data-supabase-anon="ey...">
const supabaseUrl = document.body.dataset.supabaseUrl;
const supabaseAnonKey = document.body.dataset.supabaseAnon;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or anon key not found on <body> element.  Live data features will not work.');
}

// Export a single Supabase client instance.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
