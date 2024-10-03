import S3 from "aws-sdk/clients/s3";
import { Uint8ArrayToBlob } from ".";

const s3 = new S3({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_AWS_REGION,
});

interface S3RetrieveParams {
  Bucket: string;
  Key: string;
}

interface S3UploadParams {
  Bucket: string;
  Key: string;
  Body: any;
}

const uploadFileToS3 = async (params: S3UploadParams) => {
  const uploadResult = await s3.upload(params).promise();
  return uploadResult;
};

const retrieveFileFromS3 = async (params: S3RetrieveParams) => {
  const retrieveResult = await s3.getObject(params).promise();
  return retrieveResult;
};

const convertImageS3ToBlob = async (image: string) => {
  let productImage;
  await retrieveFileFromS3({ Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME, Key: image })
    .then(imageFile => (productImage = Uint8ArrayToBlob(imageFile?.Body)))
    .catch(err => (productImage = null));

  return productImage;
};

const convertKeyToImage = async inputFile => {
  if (inputFile) {
    if (inputFile instanceof File) return URL.createObjectURL(inputFile);

    if (typeof inputFile === "string") {
      if (inputFile?.includes("blob")) return inputFile;

      if (inputFile?.includes("images/")) return await convertImageS3ToBlob(inputFile);
    }
  }
};

export { uploadFileToS3, retrieveFileFromS3, convertImageS3ToBlob, convertKeyToImage };
