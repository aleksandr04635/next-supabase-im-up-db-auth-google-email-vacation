import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
      // Check if user is authenticated
  const session = await getSession({ req });
  console.log("session from api/homes/[id]:");
  console.log(session);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { listedHomes: true },
  });
  console.log("session.user.email:");
  console.log(session.user.email);
  console.log(" listedHomes:");
  console.log(user);
  //check if id from a caller route is of a home that user of a session listed
  const { id } = req.query;
  if (!user?.listedHomes?.find(home => home.id === id)) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

    // Update home
  if (req.method === 'PATCH') {
    try {
      const home = await prisma.home.update({
        where: { id },
        data: req.body,
      });
      res.status(200).json(home);
    } catch (e) {
      res.status(500).json({ message: 'Something went wrong' });
    }
  }

  else if (req.method === 'DELETE') {
    try {
      const home = await prisma.home.delete({
        where: { id },
      });
            // Remove image from Supabase storage
            if (home.image) {
                const path = home.image.split(`${process.env.SUPABASE_BUCKET}/`)?.[1];
                await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([path]);
              }
      res.status(200).json(home);
    } catch (e) {
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
  // HTTP method not supported!
  else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
      res
        .status(405)
        .json({ message: `HTTP method ${req.method} is not supported.` });
    }
  }

