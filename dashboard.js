// dashboard.js
//
// This module adds real‑time daily tag‑up functionality to the DO117 scrum
// dashboard.  It displays existing updates, listens for new ones via
// Supabase real‑time, and allows users to submit their own updates via a form.

import { supabase } from'./upsabaseClient.js';

// Select DOM elements used by the daily update section.
const updatesList = document.querySelector('#daily-updates-list');
const updateForm = document.querySelector('#daily-update-form');
const updateTextInput = document.querySelector('#update-text');
const updateSiteInput = document.querySelector('#update-site');
const updateUserInput = document.querySelector('#update-username');

/**
 * Render an array of updates into the updates list.  Newest entries appear
 * first.  Each list item displays the timestamp, user name, site (if any)
 * and the update text.  Timestamps are formatted relative to the browser
 * locale.
 * @param {Array} updates Array of update objects returned from Supabase.
 */
function renderUpdates(updates) {
  if (!updatesList) return;
  updatesList.innerHTML = '';
  updates.forEach((row) => {
    const li = document.createElement('li');
    li.classList.add('update-item');
    const timestamp = new Date(row.created_at);
    const dateStr = timestamp.toLocaleString();
    const siteStr = row.site ? ` [${row.site}]` : '';
    li.textContent = `${dateStr} – ${row.user_name}${siteStr}: ${row.update}`;
    updatesList.appendChild(li);
  });
}

/**
 * Fetch existing updates from Supabase and render them.  Entries are
 * returned in reverse chronological order.
 */
async function fetchUpdates() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('daily_updates')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching updates:', error);
    return;
  }
  renderUpdates(data);
}

// Listen to form submissions and insert new updates into Supabase.
if (updateForm) {
  updateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const update = updateTextInput.value.trim();
    const site = updateSiteInput.value.trim();
    const userName = updateUserInput.value.trim();
    if (!update || !userName) {
      alert('Please enter your name and update text.');
      return;
    }
    const { error } = await supabase.from('daily_updates').insert({
      user_name: userName,
      site: site || null,
      update,
    });
    if (error) {
      console.error('Error inserting update:', error);
    } else {
      updateForm.reset();
    }
  });
}

// Subscribe to real‑time changes on the daily_updates table.  Whenever a
// row is inserted, updated or deleted we refresh the list.  This ensures
// everyone sees the latest updates without reloading the page.
if (supabase) {
  const channel = supabase.channel('public:daily_updates');
  channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_updates' }, (payload) => {
      // Re-fetch and re-render updates whenever anything changes.
      fetchUpdates();
    })
    .subscribe();
}

// Initial load.
fetchUpdates();
