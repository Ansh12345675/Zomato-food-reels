import { useState } from 'react'
import { Link } from 'react-router-dom'
import { postFormApi } from '../../../lib/api'
import './CreateFood.css'

function CreateFood() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [videoName, setVideoName] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const video = formData.get('video')

    setError('')
    setSuccess('')

    if (!(video instanceof File) || video.size === 0) {
      setError('Choose a video file before submitting.')
      return
    }

    if (!video.type.startsWith('video/')) {
      setError('Choose a supported video file.')
      return
    }

    setIsUploading(true)

    try {
      const result = await postFormApi('/food', formData)
      if (!result.foodItem?._id || !result.foodItem.video) {
        throw new Error('The uploaded food video was not returned by the server.')
      }

      form.reset()
      setVideoName('')
      setSuccess('Your food video has been added.')
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'Could not connect to the server. Please try again.'
          : requestError.message,
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="create-food-page">
      <header className="create-food-nav">
        <Link className="create-food-brand" to="/" aria-label="Zomato home">
          <span className="create-food-brand-mark" aria-hidden="true">z</span>
          <span>zomato</span>
        </Link>
        <Link className="create-food-profile-link" to="/food-partner/profile">
          Your profile
        </Link>
      </header>

      <section className="create-food-card" aria-labelledby="create-food-title">
        <div className="create-food-intro">
          <span className="create-food-eyebrow">Food partner studio</span>
          <h1 id="create-food-title">Show off your food</h1>
          <p>Share a short video and tell customers what makes this dish special.</p>
        </div>

        <form className="create-food-form" onSubmit={handleSubmit}>
          <label className="create-food-field" htmlFor="food-name">
            <span>Food name</span>
            <input
              id="food-name"
              name="name"
              type="text"
              placeholder="e.g. Our signature biryani"
              maxLength={120}
              autoComplete="off"
              required
            />
          </label>

          <label className="create-food-field" htmlFor="food-description">
            <span>Description</span>
            <textarea
              id="food-description"
              name="description"
              placeholder="Describe the flavors, ingredients, or story behind your dish"
              rows={4}
              maxLength={1000}
              required
            />
            <small>Give customers a reason to take a closer look.</small>
          </label>

          <label className="create-food-field" htmlFor="food-video">
            <span>Food video</span>
            <span className="create-food-file-picker">
              <span className="create-food-upload-icon" aria-hidden="true">↑</span>
              <span className="create-food-file-copy">
                <strong>{videoName || 'Choose a video to upload'}</strong>
                <small>MP4, WebM, or another supported video format</small>
              </span>
              <span className="create-food-browse">Browse</span>
              <input
                id="food-video"
                name="video"
                type="file"
                accept="video/*"
                onChange={(event) => {
                  setVideoName(event.currentTarget.files?.[0]?.name || '')
                  setError('')
                }}
                required
              />
            </span>
          </label>

          {error && <p className="create-food-message create-food-message--error" role="alert">{error}</p>}
          {success && <p className="create-food-message create-food-message--success" role="status">{success}</p>}

          <button className="create-food-submit" type="submit" disabled={isUploading}>
            {isUploading ? 'Uploading your food…' : 'Publish food video'}
          </button>
          <p className="create-food-note">Your video will appear on your food partner profile.</p>
        </form>
      </section>
    </main>
  )
}

export default CreateFood
