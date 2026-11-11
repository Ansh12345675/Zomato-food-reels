import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteApi,
  getApi,
  patchFormApi,
  postFormApi,
} from '../../../lib/api'
import '../../../App.css'

function Profile() {
  const [partner, setPartner] = useState(null)
  const [foods, setFoods] = useState([])
  const [selectedFoodId, setSelectedFoodId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isPhotoUploading, setIsPhotoUploading] = useState(false)
  const [deletingFoodId, setDeletingFoodId] = useState('')
  const [isUploadFormOpen, setIsUploadFormOpen] = useState(false)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [playbackError, setPlaybackError] = useState('')

  useEffect(() => {
    let isMounted = true

    getApi('/food/partner/me')
      .then((result) => {
        if (!result.partner || !Array.isArray(result.foods)) {
          throw new Error('The profile returned an invalid response.')
        }

        if (isMounted) {
          setPartner(result.partner)
          setFoods(result.foods)
          setSelectedFoodId(result.foods[0]?._id || '')
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(
            requestError instanceof TypeError
              ? 'We could not connect to your profile. Please try again later.'
              : requestError.message,
          )
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  async function handlePhotoChange(event) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    setProfileError('')

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setProfileError('Choose an image file for your profile photo.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Profile photos must be 5 MB or smaller.')
      return
    }

    const formData = new FormData()
    formData.append('photo', file)
    setIsPhotoUploading(true)

    try {
      const result = await patchFormApi('/food/partner/me/photo', formData)
      if (!result.profilePhoto) {
        throw new Error('The server did not return the uploaded profile photo.')
      }

      setPartner((currentPartner) => ({
        ...currentPartner,
        profilePhoto: result.profilePhoto,
      }))
    } catch (requestError) {
      setProfileError(
        requestError instanceof TypeError
          ? 'Could not connect to the server. Please try again.'
          : requestError.message,
      )
    } finally {
      setIsPhotoUploading(false)
    }
  }

  async function handleDeleteFood(food) {
    if (!window.confirm(`Delete "${food.name}" from your playlist?`)) {
      return
    }

    setUploadError('')
    setUploadSuccess('')
    setDeletingFoodId(food._id)

    try {
      await deleteApi(`/food/${encodeURIComponent(food._id)}`)
      setFoods((currentFoods) => currentFoods.filter((item) => item._id !== food._id))
      if (selectedFoodId === food._id) {
        setSelectedFoodId(foods.find((item) => item._id !== food._id)?._id || '')
      }
      setUploadSuccess('Video deleted from your playlist.')
    } catch (requestError) {
      setUploadError(
        requestError instanceof TypeError
          ? 'Could not connect to the server. Please try again.'
          : requestError.message,
      )
    } finally {
      setDeletingFoodId('')
    }
  }

  async function handleUpload(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const file = formData.get('video')

    setUploadError('')
    setUploadSuccess('')

    if (!(file instanceof File) || file.size === 0) {
      setUploadError('Choose a video file to add to your playlist.')
      return
    }

    if (!file.type.startsWith('video/')) {
      setUploadError('Choose a supported video file.')
      return
    }

    setIsUploading(true)

    try {
      const result = await postFormApi('/food', formData)
      if (!result.foodItem?._id || !result.foodItem.video) {
        throw new Error('The uploaded video was not returned by the server.')
      }

      setFoods((currentFoods) => [result.foodItem, ...currentFoods])
      setSelectedFoodId(result.foodItem._id)
      setUploadSuccess('Video added to your playlist.')
      setIsUploadFormOpen(false)
      form.reset()
    } catch (requestError) {
      setUploadError(
        requestError instanceof TypeError
          ? 'Could not connect to the server. Please try again.'
          : requestError.message,
      )
    } finally {
      setIsUploading(false)
    }
  }

  const initials = partner?.name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
  const playlist = foods
  const selectedFood = playlist.find((food) => food._id === selectedFoodId)

  return (
    <main className="partner-profile-page">
      <header className="partner-profile-nav">
        <Link className="reels-brand" to="/" aria-label="Zomato home">
          <span className="brand-mark" aria-hidden="true">
            z
          </span>
          <span>zomato</span>
        </Link>
        {!isLoading && (
          error ? (
            <Link className="partner-profile-action" to="/food-partner/login">
              Sign in to add videos
            </Link>
          ) : (
          <button
            className="partner-profile-action"
            type="button"
            onClick={() => {
              setIsUploadFormOpen((isOpen) => !isOpen)
              setUploadError('')
              setUploadSuccess('')
            }}
          >
            {isUploadFormOpen ? 'Cancel' : 'Add a video'}
            {!isUploadFormOpen && <span aria-hidden="true">+</span>}
          </button>
          )
        )}
      </header>

      <section className="partner-profile" aria-label="Food partner profile">
        {isLoading ? (
          <div className="partner-profile-state" role="status">
            <span className="reels-spinner" aria-hidden="true" />
            Loading profile…
          </div>
        ) : !partner ? (
          <div className="partner-profile-state" role="alert">
            <p>{error}</p>
            <Link to="/food-partner/login">Sign in again</Link>
          </div>
        ) : (
          <>
            <section className="partner-profile-summary">
              <div className="partner-profile-identity">
                <label className="partner-profile-avatar-picker">
                  <span className="partner-profile-avatar">
                    {partner.profilePhoto ? (
                      <img src={partner.profilePhoto} alt="" />
                    ) : (
                      initials || 'Z'
                    )}
                  </span>
                  <span className="partner-profile-avatar-edit">
                    {isPhotoUploading ? 'Uploading…' : 'Edit photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={isPhotoUploading}
                    aria-label="Choose a profile photo from your files"
                  />
                </label>
                <div className="partner-profile-details">
                  <h1>{partner.name}</h1>
                  <p>{partner.address}</p>
                </div>
              </div>

              <dl className="partner-profile-stats">
                <div className="partner-profile-stat">
                  <dt>Your videos</dt>
                  <dd>{foods.length}</dd>
                </div>
                <div className="partner-profile-stat">
                  <dt>Customers served</dt>
                  <dd title="Customer counts are not tracked yet">—</dd>
                </div>
              </dl>
            </section>

            {profileError && (
              <p className="partner-profile-feedback partner-profile-feedback--error" role="alert">
                {profileError}
              </p>
            )}

            {error && (
              <p className="partner-profile-feedback partner-profile-feedback--notice" role="status">
                {error} Sign in to view your profile and upload videos.
              </p>
            )}

            {uploadSuccess && (
              <p className="partner-profile-feedback partner-profile-feedback--success" role="status">
                {uploadSuccess}
              </p>
            )}

            {isUploadFormOpen && (
              <form className="partner-profile-upload" onSubmit={handleUpload}>
                <div className="partner-profile-upload-heading">
                  <h2>Add to your playlist</h2>
                  <p>Upload a food video to show it on your profile and store.</p>
                </div>
                <label className="partner-profile-upload-field">
                  <span>Video title</span>
                  <input
                    name="name"
                    type="text"
                    placeholder="e.g. Our signature biryani"
                    maxLength={120}
                    required
                  />
                </label>
                <label className="partner-profile-upload-field">
                  <span>Description</span>
                  <textarea
                    name="description"
                    placeholder="Tell customers what makes this dish special"
                    rows={3}
                    maxLength={1000}
                    required
                  />
                </label>
                <label className="partner-profile-upload-field">
                  <span>Food video</span>
                  <input
                    name="video"
                    type="file"
                    accept="video/*"
                    required
                  />
                  <small>Select a video file from your device.</small>
                </label>
                {uploadError && (
                  <p className="partner-profile-feedback partner-profile-feedback--error" role="alert">
                    {uploadError}
                  </p>
                )}
                <button className="partner-profile-submit" type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading video…' : 'Upload to playlist'}
                </button>
              </form>
            )}

            {playlist.length > 0 ? (
              <section className="partner-profile-playlist" aria-label="Food video playlist">
                <div className="partner-profile-player">
                  {selectedFood ? (
                    <>
                      <video
                        key={selectedFood._id}
                        src={selectedFood.video}
                        controls
                        autoPlay
                        muted
                        playsInline
                        preload="metadata"
                        onError={() => setPlaybackError(
                          'This video could not be played. Use an MP4 (H.264) or WebM video file.',
                        )}
                        onLoadedData={() => setPlaybackError('')}
                        aria-label={`Video for ${selectedFood.name}`}
                      />
                      {playbackError && (
                        <p className="partner-profile-feedback partner-profile-feedback--error" role="alert">
                          {playbackError}
                        </p>
                      )}
                      <div className="partner-profile-player-caption">
                        <h2>{selectedFood.name}</h2>
                        <p>{selectedFood.description}</p>
                      </div>
                    </>
                  ) : (
                    <p>Select a video from your playlist.</p>
                  )}
                </div>
                <div className="partner-profile-playlist-list">
                  <h2>Playlist</h2>
                  <ol>
                    {playlist.map((food, index) => (
                      <li key={food._id}>
                        <button
                          className={`partner-profile-playlist-item${food._id === selectedFoodId ? ' is-active' : ''}`}
                          type="button"
                          aria-current={food._id === selectedFoodId ? 'true' : undefined}
                          onClick={() => {
                            setSelectedFoodId(food._id)
                            setPlaybackError('')
                          }}
                        >
                          <span className="partner-profile-playlist-number">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="partner-profile-playlist-copy">
                            <strong>{food.name}</strong>
                            <small>{food.description}</small>
                          </span>
                          <span className="partner-profile-play-icon" aria-hidden="true">▶</span>
                        </button>
                        <button
                          className="partner-profile-delete"
                          type="button"
                          onClick={() => handleDeleteFood(food)}
                          disabled={deletingFoodId === food._id}
                          aria-label={`Delete ${food.name}`}
                        >
                          {deletingFoodId === food._id ? 'Deleting…' : 'Delete'}
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            ) : (
              <div className="partner-profile-empty">
                <h2>Your playlist is ready for its first video</h2>
                <p>Add a food video to feature it on your partner profile and store.</p>
                <button
                  className="partner-profile-action"
                  type="button"
                  onClick={() => setIsUploadFormOpen(true)}
                >
                  Add your first video <span aria-hidden="true">+</span>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default Profile
