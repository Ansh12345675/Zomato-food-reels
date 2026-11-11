import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApi } from '../lib/api'
import BottomNavigation from './BottomNavigation'
import '../App.css'

const LIKES_STORAGE_KEY = 'zomato-liked-foods'
const SAVED_STORAGE_KEY = 'zomato-saved-foods'
const COMMENTS_STORAGE_KEY = 'zomato-food-comments'

function readStoredValue(key, fallback, isValid) {
  const storedValue = window.localStorage.getItem(key)

  if (!storedValue) {
    return fallback
  }

  try {
    const value = JSON.parse(storedValue)
    if (isValid(value)) {
      return value
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error
    }
  }

  console.error(`Ignoring invalid saved data for "${key}".`)
  return fallback
}

function readStoredIds(key) {
  return readStoredValue(key, [], Array.isArray)
}

function readStoredComments() {
  return readStoredValue(
    COMMENTS_STORAGE_KEY,
    {},
    (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
  )
}

function Icon({ name, filled = false }) {
  const sharedProps = {
    'aria-hidden': true,
    fill: filled ? 'currentColor' : 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 2,
    viewBox: '0 0 24 24',
  }

  if (name === 'heart') {
    return (
      <svg {...sharedProps}>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
      </svg>
    )
  }

  if (name === 'bookmark') {
    return (
      <svg {...sharedProps}>
        <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z" />
      </svg>
    )
  }

  if (name === 'comment') {
    return (
      <svg {...sharedProps}>
        <path d="M20.2 11.6a8.2 8.2 0 0 1-8.5 8.2 9 9 0 0 1-3.6-.8L3 20l1.1-4.1a8 8 0 0 1-1.3-4.3 8.2 8.2 0 0 1 8.5-8.2 8.2 8.2 0 0 1 8.9 8.2Z" />
      </svg>
    )
  }

  if (name === 'home') {
    return (
      <svg {...sharedProps}>
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" />
      </svg>
    )
  }

  return (
    <svg {...sharedProps}>
      <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z" />
    </svg>
  )
}

function Reels({ savedOnly = false }) {
  const [foods, setFoods] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [likedIds, setLikedIds] = useState(() => new Set(readStoredIds(LIKES_STORAGE_KEY)))
  const [savedIds, setSavedIds] = useState(
    () => new Set(readStoredIds(SAVED_STORAGE_KEY).map(String)),
  )
  const [comments, setComments] = useState(readStoredComments)
  const [activeComments, setActiveComments] = useState(null)
  const [commentDraft, setCommentDraft] = useState('')

  useEffect(() => {
    window.localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify([...likedIds]))
  }, [likedIds])

  useEffect(() => {
    window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify([...savedIds]))
  }, [savedIds])

  useEffect(() => {
    window.localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments))
  }, [comments])

  useEffect(() => {
    let isMounted = true

    getApi('/food')
      .then((result) => {
        if (isMounted) {
          if (!Array.isArray(result.foods)) {
            throw new Error('The food feed returned an invalid response.')
          }
          setFoods(result.foods)
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(
            requestError instanceof TypeError
              ? 'We could not connect to the food feed. Please check that the server is running.'
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

  const reels = foods.filter((food) => !savedOnly || savedIds.has(String(food._id)))
  const commentList = activeComments ? comments[activeComments._id] || [] : []

  function toggleId(setter, id) {
    setter((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function submitComment(event) {
    event.preventDefault()
    const text = commentDraft.trim()

    if (!text || !activeComments) {
      return
    }

    setComments((current) => ({
      ...current,
      [activeComments._id]: [...(current[activeComments._id] || []), text],
    }))
    setCommentDraft('')
  }

  return (
    <main className="reels-page">
      <header className="reels-header">
        <Link className="reels-brand" to="/" aria-label="Zomato home">
          <span className="brand-mark" aria-hidden="true">
            z
          </span>
          <span>{savedOnly ? 'Saved videos' : 'zomato'}</span>
        </Link>
        <Link className="reels-sign-in" to="/user/login">
          Sign in <span aria-hidden="true">↗</span>
        </Link>
      </header>

      {error && (
        <div className="reels-notice" role="alert">
          {error}
        </div>
      )}

      <section className="reels-feed" aria-label="Food videos">
        {reels.map((food) => {
          const foodId = String(food._id)
          const partnerId =
            typeof food.foodPartner === 'object'
              ? food.foodPartner?._id
              : food.foodPartner
          const partnerName =
            typeof food.foodPartner === 'object'
              ? food.foodPartner?.name
              : 'Local food partner'
          const partnerAddress =
            typeof food.foodPartner === 'object'
              ? food.foodPartner?.address
              : ''

          return (
            <article className="reel" key={food._id}>
              <video
                className="reel-video"
                src={food.video}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={`Video for ${food.name}`}
              />
              <div className="reel-shade" aria-hidden="true" />
              <div className="reel-content">
                <div className="reel-copy">
                  <span className="reel-kicker">
                    {partnerName}
                  </span>
                  <h1>{food.name}</h1>
                  <p className="reel-description">{food.description}</p>
                  {partnerAddress && (
                    <span className="reel-location">{partnerAddress}</span>
                  )}
                  {partnerId && (
                    <Link
                      className="reel-store-button"
                      to={`/store/${encodeURIComponent(partnerId)}?food=${encodeURIComponent(food._id)}`}
                    >
                      Visit store <span aria-hidden="true">↗</span>
                    </Link>
                  )}
                </div>
              </div>
              <div className="reel-actions" aria-label={`Actions for ${food.name}`}>
                <button
                  className={`reel-action${likedIds.has(foodId) ? ' is-active' : ''}`}
                  type="button"
                  aria-label={`${likedIds.has(foodId) ? 'Unlike' : 'Like'} ${food.name}`}
                  aria-pressed={likedIds.has(foodId)}
                  onClick={() => toggleId(setLikedIds, foodId)}
                >
                  <Icon name="heart" filled={likedIds.has(foodId)} />
                  <span>{Number(food.likeCount ?? 23) + Number(likedIds.has(foodId))}</span>
                  <small>likes</small>
                </button>
                <button
                  className={`reel-action${savedIds.has(foodId) ? ' is-active' : ''}`}
                  type="button"
                  aria-label={`${savedIds.has(foodId) ? 'Remove from saved' : 'Save'} ${food.name}`}
                  aria-pressed={savedIds.has(foodId)}
                  onClick={() => toggleId(setSavedIds, foodId)}
                >
                  <Icon name="bookmark" filled={savedIds.has(foodId)} />
                  <span>{Number(food.saveCount ?? 23) + Number(savedIds.has(foodId))}</span>
                  <small>{savedIds.has(foodId) ? 'saved' : 'save'}</small>
                </button>
                <button
                  className="reel-action"
                  type="button"
                  aria-label={`Comments on ${food.name}`}
                  onClick={() => {
                    setActiveComments(food)
                    setCommentDraft('')
                  }}
                >
                  <Icon name="comment" />
                  <span>{Number(food.commentCount ?? 45) + (comments[food._id] || []).length}</span>
                  <small>comments</small>
                </button>
              </div>
            </article>
          )
        })}
      </section>

      {isLoading && (
        <div className="reels-loading" role="status">
          Loading food videos…
        </div>
      )}

      {!isLoading && !error && reels.length === 0 && savedOnly && (
        <div className="saved-empty">
          <span className="saved-empty-icon" aria-hidden="true">
            <Icon name="bookmark" />
          </span>
          <h1>Your saved videos live here</h1>
          <p>Save a food video to keep it close for your next craving.</p>
          <Link className="reel-store-button" to="/reels">
            Explore videos
          </Link>
        </div>
      )}

      {!isLoading && !error && !savedOnly && reels.length === 0 && (
        <div className="saved-empty">
          <h1>No food videos yet</h1>
          <p>Videos from food partners will appear here.</p>
        </div>
      )}

      <BottomNavigation />

      {activeComments && (
        <div
          className="comments-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setActiveComments(null)
            }
          }}
        >
          <section
            className="comments-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="comments-title"
          >
            <div className="comments-sheet-heading">
              <h2 id="comments-title">Comments</h2>
              <button
                type="button"
                className="comments-close"
                onClick={() => setActiveComments(null)}
                aria-label="Close comments"
              >
                ×
              </button>
            </div>
            <p className="comments-food-name">{activeComments.name}</p>
            <div className="comments-list">
              {commentList.length > 0 ? (
                commentList.map((comment, index) => (
                  <p className="comment-item" key={`${index}-${comment}`}>
                    <span className="comment-avatar" aria-hidden="true">Y</span>
                    <span><strong>You</strong>{comment}</span>
                  </p>
                ))
              ) : (
                <p className="comments-empty">Be the first to share what you think.</p>
              )}
            </div>
            <form className="comment-form" onSubmit={submitComment}>
              <label className="visually-hidden" htmlFor="comment-draft">
                Write a comment
              </label>
              <input
                id="comment-draft"
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder="Add a comment..."
                maxLength={300}
              />
              <button type="submit" disabled={!commentDraft.trim()}>
                Post
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default Reels
