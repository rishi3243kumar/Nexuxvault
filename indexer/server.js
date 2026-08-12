import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory indexed events database simulating Midnight ledger watching
let indexedVerifications = [
  {
    id: 'evt_10425_01',
    blockHeight: 10425,
    txHash: '0x3a91f892c019d4b2e88a0e1c',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    nullifierHash: '0x99a1b2c3d4e5f6a701928374',
    accessGranted: true,
    privacyModel: 'Shielded Compact Witness',
    identityExposed: false
  },
  {
    id: 'evt_10427_02',
    blockHeight: 10427,
    txHash: '0x7c42b109e4418a09f120199d',
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    nullifierHash: '0x112233445566778899aabbcc',
    accessGranted: true,
    privacyModel: 'Shielded Compact Witness',
    identityExposed: false
  }
];

let stats = {
  totalVerifications: 2,
  activeAllowlistMembers: 2,
  identityLeaksPrevented: 2,
  lastIndexedBlock: 10428
};

// GET /api/status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'NEXUS VAULT Midnight Ledger Indexer',
    network: 'Midnight Testnet',
    compactVersion: '0.14.0',
    indexedBlockHeight: stats.lastIndexedBlock,
    uptimeSeconds: process.uptime()
  });
});

// GET /api/verifications
app.get('/api/verifications', (req, res) => {
  res.json({
    success: true,
    count: indexedVerifications.length,
    events: indexedVerifications
  });
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    stats
  });
});

// POST /api/events (Record new proof verification event)
app.post('/api/events', (req, res) => {
  const { blockHeight, txHash, nullifierHash, accessGranted } = req.body;
  
  const newEvt = {
    id: `evt_${blockHeight}_${Date.now()}`,
    blockHeight: blockHeight || ++stats.lastIndexedBlock,
    txHash: txHash || `0x${Math.random().toString(16).substring(2, 18)}`,
    timestamp: new Date().toISOString(),
    nullifierHash: nullifierHash || `0x${Math.random().toString(16).substring(2, 26)}`,
    accessGranted: accessGranted !== undefined ? accessGranted : true,
    privacyModel: 'Shielded Compact Witness',
    identityExposed: false
  };

  indexedVerifications.unshift(newEvt);
  stats.totalVerifications++;
  stats.identityLeaksPrevented++;
  stats.lastIndexedBlock = newEvt.blockHeight;

  res.status(201).json({
    success: true,
    message: 'Event successfully indexed from Midnight ledger',
    event: newEvt
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`⚡ VeilPass Indexer Service listening on http://localhost:${PORT}`);
  });
}

export default app;
