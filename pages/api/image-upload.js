
//api/image-upload

import { nanoid } from 'nanoid';
import { decode } from 'base64-arraybuffer';

// pages/api/image-upload.js
import { supabase } from '@/lib/supabase';

export const config = {
    api: {
      bodyParser: {
        sizeLimit: '10mb',
      },
    },
  };

export default async function handler(req, res) {
    // Upload image to Supabase
// Upload image to Supabase
if (req.method === 'POST') {
    console.log('post:');
    //console.log(req.body);
    let { image } = req.body;
    //console.log('image:');
    //console.log(image);
    if (!image) {
      return res.status(500).json({ message: 'No image provided' });
    }
  
    try {
      const contentType = image.match(/data:(.*);base64/)?.[1];
      const base64FileData = image.split('base64,')?.[1];
     // console.log('base64FileData:');
   // console.log(base64FileData);
    console.log('contentType:');
    console.log(contentType);
    console.log('decode(base64FileData):');
    console.log(decode(base64FileData));

      if (!contentType || !base64FileData) {
        return res.status(500).json({ message: 'Image data not valid' });
      }
  
      // Upload image
      const fileName = nanoid();
      const ext = contentType.split('/')[1];
      const path = `${fileName}.${ext}`;

      console.log('path:');
    console.log(path);

      const { data, error: uploadError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(path, decode(base64FileData), {
          contentType,
          upsert: true,
        });
        console.log("uploaded image data:");
  console.log(data);
 // console.log("data.Key:");
  //console.log(data.Key);
      if (uploadError) {
        console.log(uploadError);
        throw new Error('Unable to upload image to storage');
      }
  
      // Construct public URL
      //old version
     // const url = `${process.env.SUPABASE_URL.replace(
     //   '.co',
    //    '.in'
    //  )}/storage/v1/object/public/${data.Key}`;
  //my version
  const url = `${process.env.SUPABASE_URL.replace(
    '.co',
    '.in'
  )}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${data.path}`;
  console.log("url:");
  console.log(url);
      return res.status(200).json({ url });
    } catch (e) {
      res.status(500).json({ message: 'Something went wrong' });
      console.log("err:");
      console.log(e);
    }
  }
    // HTTP method not supported!
    else {
      res.setHeader('Allow', ['POST']);
      res
        .status(405)
        .json({ message: `HTTP method ${req.method} is not supported.` });
    }
  }