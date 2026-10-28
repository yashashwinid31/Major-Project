import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  generateDID, 
  generateKeyPair, 
  calculateSHA256, 
  generateCID, 
  generateTxHash, 
  generateBlockNumber 
} from '../utils/cryptoUtils';

const IdentityContext = createContext(null);

export const useIdentity = () => {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error('useIdentity must be used within an IdentityProvider');
  }
  return context;
};

const INITIAL_VERIFIERS = [
  { 
    id: 'ver-1', 
    name: 'Global Tech Enterprises', 
    organization: 'Employment Verification Dept', 
    status: 'GRANTED', 
    grantedAt: '2026-07-28 10:30 UTC', 
    duration: 'Permanent',
    did: 'did:identity:0x891a3f9e2b1048ca09e122b15809ab44c2ef0192'
  },
  { 
    id: 'ver-2', 
    name: 'Metro National Bank', 
    organization: 'KYC & Compliance Board', 
    status: 'GRANTED', 
    grantedAt: '2026-07-29 09:15 UTC', 
    duration: '30 Days',
    did: 'did:identity:0x41f878a9c1e0029b376510a991823ef512b077a1'
  },
  { 
    id: 'ver-3', 
    name: 'State Academic Registry', 
    organization: 'Degree Authentication', 
    status: 'REVOKED', 
    grantedAt: '2026-07-20 14:00 UTC', 
    duration: 'Expired',
    did: 'did:identity:0x77c2980112ee5694210a448109312ffc8910d291'
  }
];

const INITIAL_LOGS = [
  {
    id: 'log-101',
    timestamp: '2026-07-28 10:30:12',
    verifierName: 'Global Tech Enterprises',
    action: 'ACCESS_GRANTED',
    status: 'CONFIRMED',
    did: 'did:identity:0x891a3f9e...',
    docType: 'Educational Degree',
    txHash: '0x39a1b02847c1e92d89047120aef192b0c1e84771a9902bc014871aa904f691bc'
  },
  {
    id: 'log-102',
    timestamp: '2026-07-29 09:15:44',
    verifierName: 'Metro National Bank',
    action: 'VERIFICATION_REQUEST',
    status: 'SUCCESS',
    did: 'did:identity:0x41f878a9...',
    docType: 'Identity Proof',
    txHash: '0x882f01948ba109f5e1009182aa4d69101b089c67290141fbe1094892c90184b2'
  },
  {
    id: 'log-103',
    timestamp: '2026-07-29 11:02:18',
    verifierName: 'State Academic Registry',
    action: 'ACCESS_REVOKED',
    status: 'CONFIRMED',
    did: 'did:identity:0x77c29801...',
    docType: 'Educational Degree',
    txHash: '0x12a9e88401928bcfe0018764b8109923a10984fce0987110e66100984ba10291'
  }
];

export const IdentityProvider = ({ children }) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [userProfile, setUserProfile] = useState(null);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [mlResult, setMlResult] = useState(null);
  const [ipfsData, setIpfsData] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);
  const [accessPermissions, setAccessPermissions] = useState(INITIAL_VERIFIERS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_LOGS);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [totalDocumentCount, setTotalDocumentCount] = useState(3);

  const updateDocumentCount = (count) => {
    setTotalDocumentCount(count);
  };

  // Load initial backend state on mount
  useEffect(() => {
    // 1. Fetch User Profile
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.profile) {
          setUserProfile(data.profile);
        } else {
          // Default fallback demo profile
          const keys = generateKeyPair();
          const did = generateDID("demo_user_alexander");
          setUserProfile({
            registered: true,
            fullName: "Alexander Vance",
            email: "alexander.vance@identity.io",
            password: "••••••••",
            dob: "1998-04-12",
            role: "Identity Owner",
            did: did,
            keys: keys,
            registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
          });
        }
      })
      .catch(() => {
        const keys = generateKeyPair();
        const did = generateDID("demo_user_alexander");
        setUserProfile({
          registered: true,
          fullName: "Alexander Vance",
          email: "alexander.vance@identity.io",
          password: "••••••••",
          dob: "1998-04-12",
          role: "Identity Owner",
          did: did,
          keys: keys,
          registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
        });
      });

    // 2. Fetch Access Control Verifiers
    fetch('/api/access-control/verifiers')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.verifiers && data.verifiers.length > 0) {
          setAccessPermissions(data.verifiers);
        }
      })
      .catch(err => console.warn('Backend verifiers fetch fallback:', err));

    // 3. Fetch Audit Logs
    fetch('/api/blockchain/logs')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.logs && data.logs.length > 0) {
          setAuditLogs(data.logs);
        }
      })
      .catch(err => console.warn('Backend logs fetch fallback:', err));

    // 4. Fetch Document Stats
    fetch('/api/documents/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTotalDocumentCount(data.totalCount);
        }
      })
      .catch(err => console.warn('Backend stats fetch fallback:', err));
  }, []);

  // Stage 1: Register User
  const registerUser = async (data) => {
    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success && result.profile) {
        setUserProfile(result.profile);
        return result.profile;
      }
    } catch (err) {
      console.warn('Register user API fallback:', err);
    }

    const keys = generateKeyPair();
    const did = generateDID(data.email || data.fullName);
    const profile = {
      registered: true,
      fullName: data.fullName,
      email: data.email,
      password: data.password || '••••••••',
      dob: data.dob,
      role: data.role || "Identity Owner",
      did: did,
      keys: keys,
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
    };
    setUserProfile(profile);
    return profile;
  };

  // Stage 2: Upload Document
  const uploadDocument = (docObj) => {
    if (!docObj) {
      setUploadedDoc(null);
      return;
    }
    const formattedUploadTime = docObj.uploadTime || new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const docWithDefaults = {
      uploadTime: formattedUploadTime,
      preprocessing: docObj.preprocessing || {
        boundaryDetected: true,
        boundaryCoords: { x: 20, y: 20, width: 560, height: 380 },
        qualityScore: 96.5,
        noiseLevel: "0.015 (Filtered)",
        skewAngle: "-1.4° → 0.0° (Deskewed)",
        tensorShape: "[1, 3, 512, 512]"
      },
      ...docObj
    };
    setUploadedDoc(docWithDefaults);
    setMlResult(null);
    setIpfsData(null);
    setBlockchainData(null);
  };

  // Stage 3: ML Forgery Scan
  const setMlScanResult = async (result, overrideVerdict = 'auto') => {
    setMlResult(result);

    if (uploadedDoc?.documentId) {
      try {
        await fetch(`/api/documents/${uploadedDoc.documentId}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ overrideVerdict })
        });
      } catch (err) {
        console.warn('Backend scan status sync failed:', err);
      }
    }
  };

  // Stage 4: IPFS Storage
  const pinDocumentToIPFS = async () => {
    if (!uploadedDoc) return null;
    const docHash = await calculateSHA256(uploadedDoc.rawHashSeed || uploadedDoc.fileName);

    try {
      const response = await fetch('/api/ipfs/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docId: uploadedDoc.documentId,
          docHash,
          fileSize: uploadedDoc.fileSize
        })
      });
      const data = await response.json();
      if (data.success && data.ipfsRecord) {
        setIpfsData(data.ipfsRecord);
        return data.ipfsRecord;
      }
    } catch (err) {
      console.warn('Backend IPFS pin API fallback:', err);
    }

    const cid = generateCID(docHash);
    const ipfsRecord = {
      pinned: true,
      cid: cid,
      docHash: docHash,
      gatewayUrl: `https://ipfs.io/ipfs/${cid}`,
      nodeCount: 24,
      fileSize: uploadedDoc.fileSize || "142 KB",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
    };
    setIpfsData(ipfsRecord);
    return ipfsRecord;
  };

  // Stage 5: Blockchain Storage
  const recordOnBlockchain = async () => {
    if (!userProfile || !ipfsData || !uploadedDoc) return null;

    try {
      const response = await fetch('/api/blockchain/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDID: userProfile.did,
          ipfsCID: ipfsData.cid,
          docHash: ipfsData.docHash,
          docType: uploadedDoc.category,
          fullName: userProfile.fullName
        })
      });
      const data = await response.json();
      if (data.success && data.blockchainRecord) {
        setBlockchainData(data.blockchainRecord);

        // Refresh audit logs from backend
        fetch('/api/blockchain/logs')
          .then(res => res.json())
          .then(logData => {
            if (logData.success && logData.logs) setAuditLogs(logData.logs);
          })
          .catch(() => {});

        return data.blockchainRecord;
      }
    } catch (err) {
      console.warn('Backend blockchain record API fallback:', err);
    }

    const txHash = generateTxHash();
    const blockNum = generateBlockNumber();
    const gasUsed = Math.floor(45000 + Math.random() * 8000);
    const contractAddress = "0x7F9a92C18e4708d132A69A5649f82E8d49B55e10";
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    const record = {
      mined: true,
      txHash: txHash,
      blockNumber: blockNum,
      gasUsed: gasUsed,
      contractAddress: contractAddress,
      network: "IdentityChain Sepolia Testnet",
      timestamp: timestamp,
      payload: {
        userDID: userProfile.did,
        ipfsCID: ipfsData.cid,
        documentHash: ipfsData.docHash,
        documentType: uploadedDoc.category,
        issuedTo: userProfile.fullName,
        smartContractMethod: "storeIdentityDocumentRecord(bytes32,string,string)"
      }
    };

    setBlockchainData(record);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: timestamp,
      verifierName: 'System / Smart Contract',
      action: 'BLOCKCHAIN_RECORDED',
      status: 'MINED & FINALIZED',
      did: userProfile.did.substring(0, 20) + '...',
      docType: uploadedDoc.category,
      txHash: txHash
    };
    setAuditLogs(prev => [newLog, ...prev]);
    return record;
  };

  // Stage 6: Verify Document Query
  const addVerificationResult = async (queryResult) => {
    if (queryResult?.queriedCID) {
      try {
        const response = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queriedCID: queryResult.queriedCID })
        });
        const data = await response.json();
        if (data.success && data.verdict) {
          setVerificationHistory(prev => [data.verdict, ...prev]);
          return;
        }
      } catch (err) {
        console.warn('Backend verify API fallback:', err);
      }
    }
    setVerificationHistory(prev => [queryResult, ...prev]);
  };

  // Stage 7: Access Control Actions
  const toggleVerifierStatus = async (verifierId) => {
    try {
      const response = await fetch(`/api/access-control/verifiers/${verifierId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDID: userProfile?.did,
          docType: uploadedDoc?.category || 'Educational Degree'
        })
      });
      const data = await response.json();
      if (data.success) {
        setAccessPermissions(prev => prev.map(v => v.id === verifierId ? data.verifier : v));
        // Refresh audit logs
        fetch('/api/blockchain/logs')
          .then(res => res.json())
          .then(logData => {
            if (logData.success && logData.logs) setAuditLogs(logData.logs);
          })
          .catch(() => {});
        return;
      }
    } catch (err) {
      console.warn('Backend toggle verifier API fallback:', err);
    }

    setAccessPermissions(prev => prev.map(v => {
      if (v.id === verifierId) {
        const newStatus = v.status === 'GRANTED' ? 'REVOKED' : 'GRANTED';
        const actionType = newStatus === 'GRANTED' ? 'ACCESS_GRANTED' : 'ACCESS_REVOKED';
        const txHash = generateTxHash();

        setAuditLogs(logs => [{
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          verifierName: v.name,
          action: actionType,
          status: 'CONFIRMED',
          did: userProfile?.did ? userProfile.did.substring(0, 20) + '...' : 'did:identity:0x891a...',
          docType: uploadedDoc?.category || 'Educational Degree',
          txHash: txHash
        }, ...logs]);

        return {
          ...v,
          status: newStatus,
          grantedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
        };
      }
      return v;
    }));
  };

  const addVerifier = async (name, organization, duration) => {
    try {
      const response = await fetch('/api/access-control/verifiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          organization,
          duration,
          userDID: userProfile?.did,
          docType: uploadedDoc?.category || 'Educational Degree'
        })
      });
      const data = await response.json();
      if (data.success && data.verifier) {
        setAccessPermissions(prev => [data.verifier, ...prev]);
        fetch('/api/blockchain/logs')
          .then(res => res.json())
          .then(logData => {
            if (logData.success && logData.logs) setAuditLogs(logData.logs);
          })
          .catch(() => {});
        return;
      }
    } catch (err) {
      console.warn('Backend add verifier API fallback:', err);
    }

    const newVerifier = {
      id: `ver-${Date.now()}`,
      name: name,
      organization: organization,
      status: 'GRANTED',
      grantedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      duration: duration || '30 Days',
      did: generateDID(name)
    };
    setAccessPermissions(prev => [newVerifier, ...prev]);

    const txHash = generateTxHash();
    setAuditLogs(logs => [{
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      verifierName: name,
      action: 'ACCESS_GRANTED',
      status: 'CONFIRMED',
      did: userProfile?.did ? userProfile.did.substring(0, 20) + '...' : 'did:identity:0x891a...',
      docType: uploadedDoc?.category || 'Educational Degree',
      txHash: txHash
    }, ...logs]);
  };

  return (
    <IdentityContext.Provider value={{
      currentStage,
      setCurrentStage,
      userProfile,
      registerUser,
      uploadedDoc,
      uploadDocument,
      mlResult,
      setMlScanResult,
      ipfsData,
      pinDocumentToIPFS,
      blockchainData,
      recordOnBlockchain,
      accessPermissions,
      toggleVerifierStatus,
      addVerifier,
      auditLogs,
      verificationHistory,
      addVerificationResult,
      totalDocumentCount,
      updateDocumentCount
    }}>
      {children}
    </IdentityContext.Provider>
  );
};
