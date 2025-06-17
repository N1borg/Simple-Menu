import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { password, hash } = JSON.parse(req.body)

  if (!password || !hash) return res.status(400).json(false)

  const match = await bcrypt.compare(password, hash)
  res.status(200).json(match)
}
