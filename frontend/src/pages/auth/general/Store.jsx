import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getApi } from '../../../lib/api'
import '../../../App.css'

function Store() {
  const { partnerId } = useParams()
  const [searchParams] = useSearchParams()
  const selectedFoodId = searchParams.get('food')
  const [foods, setFoods] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    getApi(`/food/partner/${encodeURIComponent(partnerId)}`)
      .then((result) => {
        if (isMounted) {
          if (!Array.isArray(result.foods)) {
            throw new Error('The store returned an invalid response.')
          }
          setFoods(result.foods)
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(
            requestError instanceof TypeError
              ? 'We could not connect to this store. Please try again later.'
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
  }, [partnerId])

  const storeFoods = foods
  const partner = foods[0]?.foodPartner
  const selectedFood =
    storeFoods.find((food) => food._id === selectedFoodId) || storeFoods[0]

  return (
    <main className="store-page">
      <header className="store-header">
        <Link className="reels-brand" to="/" aria-label="Back to food videos">
          <span className="brand-mark" aria-hidden="true">
            z
          </span>
          <span>zomato</span>
        </Link>
        <Link className="store-back-link" to="/">
          Back to videos
        </Link>
      </header>

      <section className="store-content">
        {isLoading ? (
          <div className="reels-loading" role="status">
            <span className="reels-spinner" aria-hidden="true" />
            Loading store…
          </div>
        ) : error ? (
          <p className="store-message" role="alert">
            {error}
          </p>
        ) : partner ? (
          <>
            <span className="store-eyebrow">
              Food partner
            </span>
            <h1>{partner.name}</h1>
            {partner.address && <p className="store-address">{partner.address}</p>}
            {selectedFood && (
              <article className="store-featured-food">
                <video
                  src={selectedFood.video}
                  controls
                  autoPlay
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={`Video for ${selectedFood.name}`}
                />
                <div>
                  <span className="store-eyebrow">Selected from the video feed</span>
                  <h2>{selectedFood.name}</h2>
                  <p>{selectedFood.description}</p>
                </div>
              </article>
            )}
            <h2>On the menu</h2>
            <div className="store-menu">
              {storeFoods.filter((food) => food._id !== selectedFood?._id).map((food) => (
                <article className="store-menu-item" key={food._id}>
                  <video
                    src={food.video}
                    controls
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={`Video for ${food.name}`}
                  />
                  <div>
                    <h3>{food.name}</h3>
                    <p>{food.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="store-empty">
            <span className="store-eyebrow">Store unavailable</span>
            <h1>We couldn’t find this store.</h1>
            <p>It may have moved. Head back to the feed to find another favorite.</p>
            <Link className="home-button home-button--primary" to="/">
              Back to videos
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}

export default Store
