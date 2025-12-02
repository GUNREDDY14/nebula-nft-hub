import { toast } from 'sonner';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY || '';
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export const isPinataConfigured = (): boolean => {
  return !!(PINATA_JWT || (PINATA_API_KEY && PINATA_SECRET_KEY));
};

export const uploadToPinata = async (file: File): Promise<string> => {
  if (!isPinataConfigured()) {
    throw new Error('Pinata API keys not configured. Please add them to your .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: file.name,
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', options);

  try {
    const headers: HeadersInit = {};
    
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload to Pinata');
    }

    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error: any) {
    console.error('Pinata upload error:', error);
    throw new Error(error.message || 'Failed to upload file to IPFS');
  }
};

export const uploadMetadataToPinata = async (metadata: NFTMetadata): Promise<string> => {
  if (!isPinataConfigured()) {
    throw new Error('Pinata API keys not configured. Please add them to your .env file.');
  }

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `${metadata.name}-metadata.json`,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload metadata to Pinata');
    }

    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error: any) {
    console.error('Pinata metadata upload error:', error);
    throw new Error(error.message || 'Failed to upload metadata to IPFS');
  }
};

export const getIPFSUrl = (ipfsUri: string): string => {
  if (!ipfsUri) return '';
  
  if (ipfsUri.startsWith('ipfs://')) {
    const hash = ipfsUri.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  
  if (ipfsUri.startsWith('https://')) {
    return ipfsUri;
  }
  
  return `https://gateway.pinata.cloud/ipfs/${ipfsUri}`;
};
