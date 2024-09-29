import { PinataSDK } from "pinata-web3";

export const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

export async function uploadFileToPinata(file: File) {
    try {
      console.log(process.env.NEXT_PUBLIC_JWT, process.env.NEXT_PUBLIC_PINATA_GATEWAY)
      const upload = await pinata.upload.file(file);
      console.log(upload);
      return upload;
    } catch (error) {
      console.error("Error uploading file to Pinata:", error);
      throw error;
    }
  }