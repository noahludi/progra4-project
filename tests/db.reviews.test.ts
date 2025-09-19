import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import Review from '../src/models/Review'

let mongo: MongoMemoryServer

beforeAll(async () => {
  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongo.stop()
})

afterEach(async () => {
  await Review.deleteMany({})
})

describe('Review CRUD con Mongo', () => {
  it('crea, actualiza y borra', async () => {
    const userId = new mongoose.Types.ObjectId()
    const r = await Review.create({
      user: userId,
      bookId: 'book-123',
      title: 'Titulo',
      content: 'Contenido',
      rating: 5,
    })
    expect(r._id).toBeDefined()

    r.title = 'Titulo 2'
    await r.save()
    const got = await Review.findById(r._id)
    expect(got?.title).toBe('Titulo 2')

    await Review.deleteOne({ _id: r._id })
    const gone = await Review.findById(r._id)
    expect(gone).toBeNull()
  })
})
