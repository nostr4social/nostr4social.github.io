/**
 * Nostr Integration using nostr-tools
 * This file initializes nostr-tools and provides utilities for Nostr interactions
 */

// Global nostr-tools instances
let pool = null;
const relays = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://relay.primal.net'
];

/**
 * Initialize nostr-tools connection
 */
async function initializeNostr() {
  try {
    // Check if NostrTools is available
    if (typeof window.NostrTools === 'undefined') {
      console.error('❌ nostr-tools library not loaded. Make sure the CDN script is included.');
      return null;
    }

    // Create SimplePool instance
    pool = new window.NostrTools.SimplePool();
    console.log('✅ Connected to Nostr relays via nostr-tools');
    console.log('📡 Using relays:', relays);

    return pool;
  } catch (error) {
    console.error('❌ Failed to initialize nostr-tools:', error);
    return null;
  }
}

/**
 * Subscribe to Nostr events
 * @param {Object} filter - Nostr filter object (kinds, authors, limit, etc.)
 * @param {Function} onEvent - Callback function for each event
 * @param {Function} onEose - Optional callback for EOSE
 * @returns {Object} Subscription object with stop() method
 */
function subscribeToEvents(filter, onEvent, onEose) {
  if (!pool) {
    console.error('❌ nostr-tools not initialized. Call initializeNostr() first.');
    return null;
  }

  const sub = pool.subscribeMany(
    relays,
    [filter],
    {
      onevent(event) {
        if (typeof onEvent === 'function') {
          onEvent(event);
        }
      },
      oneose() {
        console.log('📡 End of stored events (EOSE) received');
        if (typeof onEose === 'function') {
          onEose();
        }
      }
    }
  );

  return {
    stop: () => sub.close(),
    subscription: sub
  };
}

/**
 * Fetch user profile
 * @param {string} pubkey - User's public key (hex format)
 * @returns {Promise<Object>} User profile data
 */
async function fetchUserProfile(pubkey) {
  if (!pool) {
    console.error('❌ nostr-tools not initialized. Call initializeNostr() first.');
    return null;
  }

  try {
    // Query for kind 0 (metadata) events for this pubkey
    const event = await pool.get(relays, {
      kinds: [0],
      authors: [pubkey]
    });

    if (event && event.content) {
      const profile = JSON.parse(event.content);
      return profile;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Failed to fetch user profile:', error);
    return null;
  }
}

/**
 * Publish a note to Nostr
 * @param {string} content - Note content
 * @param {Uint8Array} secretKey - Secret key for signing (optional, will use NIP-07 if available)
 * @returns {Promise<Object>} Published event
 */
async function publishNote(content, secretKey) {
  if (!pool) {
    console.error('❌ nostr-tools not initialized. Call initializeNostr() first.');
    return null;
  }

  try {
    const eventTemplate = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: content
    };

    let signedEvent;
    
    // If secret key provided, use it to sign
    if (secretKey) {
      signedEvent = window.NostrTools.finalizeEvent(eventTemplate, secretKey);
    } 
    // Otherwise try to use NIP-07 browser extension
    else if (window.nostr) {
      const pubkey = await window.nostr.getPublicKey();
      eventTemplate.pubkey = pubkey;
      signedEvent = await window.nostr.signEvent(eventTemplate);
    } else {
      console.error('❌ No signing method available. Provide a secret key or use a NIP-07 extension.');
      return null;
    }

    // Publish to relays
    await Promise.any(pool.publish(relays, signedEvent));
    console.log('✅ Note published successfully');
    return signedEvent;
  } catch (error) {
    console.error('❌ Failed to publish note:', error);
    return null;
  }
}

/**
 * Get pool instance
 * @returns {Object} SimplePool instance
 */
function getPool() {
  return pool;
}

/**
 * Generate a new key pair
 * @returns {Object} Object with secretKey (Uint8Array) and publicKey (hex string)
 */
function generateKeyPair() {
  const secretKey = window.NostrTools.generateSecretKey();
  const publicKey = window.NostrTools.getPublicKey(secretKey);
  return { secretKey, publicKey };
}

/**
 * Query events synchronously
 * @param {Object} filter - Nostr filter
 * @returns {Array} Array of events
 */
function queryEvents(filter) {
  if (!pool) {
    console.error('❌ nostr-tools not initialized. Call initializeNostr() first.');
    return [];
  }
  return pool.querySync(relays, filter);
}

// Initialize nostr-tools when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    if (window.Nostr4DisableGlobalNostrTools) {
      console.log('nostrtools.js: auto-init disabled by page');
      return;
    }
  } catch (_) {}
  console.log('🚀 Initializing Nostr integration...');
  await initializeNostr();
});

// Export functions for global use
window.NostrTools = window.NostrTools || {};
window.NostrTools.local = {
  initializeNostr,
  subscribeToEvents,
  fetchUserProfile,
  publishNote,
  generateKeyPair,
  queryEvents,
  getPool,
  relays
};
