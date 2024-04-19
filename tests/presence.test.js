const { handlePresence } = require('../events/presence')
const { describe, expect, it } = require('@jest/globals')
const { checkUser } = require('../utils/userFunctions')
const { updateStreamStatus, announceStream } = require('../utils/streamHelpers')

jest.mock('../utils/streamHelpers', () => ({
  updateStreamStatus: jest.fn(),
  announceStream: jest.fn(),
}))

jest.mock('../utils/userFunctions', () => ({
  checkUser: jest.fn(),
}))

jest.mock('discord.js', () => {
  const ActivityType = {
    Streaming: 'STREAMING',
  }

  return {
    ActivityType,
    Activity: jest
      .fn()
      .mockImplementation(
        ({
          type = ActivityType.Streaming,
          name = 'Twitch',
          url = 'http://twitch.tv/example',
          details = 'Playing Fun Game',
          state = 'Online',
          timestamps = { start: Date.now() },
        } = {}) => ({
          type,
          name,
          url,
          details,
          state,
          timestamps,
        }),
      ),
  }
})

describe('handlePresence', () => {
  it('Lopettaa suorittamisen välittömästi, jos käyttäjä on botti', async () => {
    const oldPresence = { user: { bot: false }, activities: [] }
    const newPresence = { user: { bot: true }, activities: [] }

    const result = await handlePresence(oldPresence, newPresence)

    expect(result).toBeUndefined()
  })

  it('Antaa striimi-ilmoituksen, jos käyttäjä ei ole jo striimaamassa', async () => {
    debugger
    const oldPresence = { user: { bot: false }, activities: [] }
    const newPresence = {
      user: { bot: false, avatarURL: () => 'avatarURL' },
      activities: [
        {
          type: 'STREAMING',
          url: 'striimin_osoite',
          details: 'Fun Game',
          state: 'Playing',
        },
      ],
    }

    checkUser.mockResolvedValue({ isStreaming: false })
    updateStreamStatus.mockResolvedValue(true)

    await handlePresence(oldPresence, newPresence)

    expect(checkUser).toHaveBeenCalled()
    expect(updateStreamStatus).toHaveBeenCalledWith(expect.any(Object), true)
    expect(announceStream).toHaveBeenCalled()
  })

  it('Pitäisi lopettaa striimitila, jos käyttäjä lopettaa striimin', async () => {
    const oldPresence = {
      user: { bot: false, avatarURL: () => 'avatarUrl' },
      activities: [{ type: 'STREAMING', url: 'striimin_osoite' }],
    }
    const newPresence = {
      user: { bot: false, avatarURL: () => 'avatarUrl' },
      activities: [],
    }

    checkUser.mockResolvedValue({ isStreaming: true })
    updateStreamStatus.mockResolvedValue(true)

    await handlePresence(oldPresence, newPresence)

    expect(checkUser).toHaveBeenCalled()
    expect(updateStreamStatus).toHaveBeenCalledWith(expect.any(Object), false)
  })
})
