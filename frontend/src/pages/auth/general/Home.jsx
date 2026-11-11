import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BottomNavigation from '../../../components/BottomNavigation'
import { getApi } from '../../../lib/api'
import './Home.css'

function firstValue(record, fields) {
  for (const field of fields) {
    const value = record?.[field]
    if (Array.isArray(value)) {
      const entries = value.filter((entry) => typeof entry === 'string' && entry.trim())
      if (entries.length) {
        return entries.join(', ')
      }
    }
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value
    }
  }

  return null
}

function formatPrice(value) {
  if (typeof value === 'number') {
    return `₹${value.toLocaleString('en-IN')}`
  }
  return value
}

function makeRestaurants(foods) {
  const partners = new Map()

  foods.forEach((food) => {
    const partner = food.foodPartner
    if (!partner || typeof partner !== 'object' || !partner._id || !partner.name) {
      return
    }

    const id = String(partner._id)
    const restaurant = partners.get(id)

    if (restaurant) {
      restaurant.foods.push(food)
    } else {
      partners.set(id, {
        id,
        name: partner.name,
        address: partner.address || '',
        rating: firstValue(partner, ['rating', 'averageRating']),
        cuisine: firstValue(partner, ['cuisine', 'cuisines']),
        price: firstValue(partner, ['priceRange', 'averageCost', 'costForTwo', 'price']),
        deliveryTime: firstValue(partner, ['deliveryTime', 'deliveryTimeMinutes']),
        foods: [food],
      })
    }
  })

  return [...partners.values()]
}

function Home() {
  const [foods, setFoods] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [activeSection, setActiveSection] = useState('delivery')

  useEffect(() => {
    let isMounted = true

    getApi('/food')
      .then((result) => {
        if (!Array.isArray(result.foods)) {
          throw new Error('The food feed returned an invalid response.')
        }

        if (isMounted) {
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

  const restaurants = useMemo(() => makeRestaurants(foods), [foods])
  const locations = useMemo(
    () => [...new Set(restaurants.map((restaurant) => restaurant.address).filter(Boolean))],
    [restaurants],
  )
  const dishes = useMemo(() => {
    const seen = new Set()
    return restaurants.flatMap((restaurant) =>
      restaurant.foods.filter((food) => {
        const name = food.name?.trim()
        if (!name || seen.has(name.toLowerCase())) {
          return false
        }
        seen.add(name.toLowerCase())
        return true
      }),
    )
  }, [restaurants])

  const visibleRestaurants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return restaurants.filter((restaurant) => {
      const matchesLocation = !location || restaurant.address === location
      const matchesQuery =
        !query ||
        [restaurant.name, restaurant.address, ...restaurant.foods.flatMap((food) => [
          food.name,
          food.description,
        ])]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))

      return matchesLocation && matchesQuery
    })
  }, [location, restaurants, searchQuery])

  const featuredRestaurant = visibleRestaurants[0]
  const featuredFood = featuredRestaurant?.foods[0]

  function foodPoster(food) {
    return food.thumbnailUrl || food.thumbnail || food.posterUrl || food.poster || undefined
  }

  function storeHref(restaurant, food) {
    return `/store/${encodeURIComponent(restaurant.id)}?food=${encodeURIComponent(food._id)}`
  }

  return (
    <main className="discovery-page">
      <header className="discovery-header">
        <div className="discovery-header-inner">
          <Link className="discovery-brand" to="/" aria-label="Zomato home">
            <span className="discovery-brand-mark" aria-hidden="true">z</span>
            <span>zomato</span>
          </Link>

          <label className="discovery-location">
            <span>Partner location</span>
            <select
              aria-label="Choose a partner location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              <option value="">All partner locations</option>
              {locations.map((address) => (
                <option key={address} value={address}>{address}</option>
              ))}
            </select>
          </label>

          <label className="discovery-search">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search restaurants or dishes"
              aria-label="Search restaurants, dishes, and locations"
            />
          </label>

          <Link className="discovery-sign-in" to="/user/login">Sign in</Link>
        </div>
      </header>

      <div className="discovery-content">
        <section className="discovery-mode" aria-label="Explore food">
          <button
            className={activeSection === 'delivery' ? 'is-selected' : ''}
            type="button"
            aria-pressed={activeSection === 'delivery'}
            onClick={() => setActiveSection('delivery')}
          >
            <span className="discovery-mode-icon" aria-hidden="true">↗</span>
            Delivery
          </button>
          <button
            className={activeSection === 'dining' ? 'is-selected' : ''}
            type="button"
            aria-pressed={activeSection === 'dining'}
            onClick={() => setActiveSection('dining')}
          >
            <span className="discovery-mode-icon" aria-hidden="true">⌂</span>
            Dining Out
          </button>
        </section>

        {activeSection === 'dining' ? (
          <section className="discovery-unavailable" aria-live="polite">
            <span className="discovery-eyebrow">Dining Out</span>
            <h1>Dining-out listings aren’t available yet</h1>
            <p>
              The current project data includes food partner videos and store
              menus, but not restaurant dining listings.
            </p>
            <button type="button" onClick={() => setActiveSection('delivery')}>
              Explore food partners
            </button>
          </section>
        ) : (
          <>
            <section className="discovery-hero" aria-label="Food discovery">
              {featuredFood?.video && (
                <video
                  className="discovery-hero-video"
                  src={featuredFood.video}
                  poster={foodPoster(featuredFood)}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                />
              )}
              <div className="discovery-hero-shade" aria-hidden="true" />
              <div className="discovery-hero-copy">
                <span className="discovery-hero-kicker">
                  <span aria-hidden="true">✦</span> A taste of something special
                </span>
                <h1>Good food.<br />Great little moments.</h1>
                <p>
                  {featuredFood && featuredRestaurant
                    ? `Discover ${featuredFood.name} and more from ${featuredRestaurant.name}.`
                    : 'Discover real dishes shared by food partners near you.'}
                </p>
                <div className="discovery-hero-actions">
                  {featuredRestaurant && featuredFood && (
                    <Link className="discovery-hero-primary" to={storeHref(featuredRestaurant, featuredFood)}>
                      Explore the menu <span aria-hidden="true">→</span>
                    </Link>
                  )}
                  <Link className="discovery-hero-secondary" to="/reels">
                    Watch food reels
                  </Link>
                </div>
              </div>
              {featuredFood && (
                <div className="discovery-hero-caption">
                  <span>Featured from the feed</span>
                  <strong>{featuredFood.name}</strong>
                  {featuredRestaurant && <small>{featuredRestaurant.name}</small>}
                </div>
              )}
            </section>

            {dishes.length > 0 && (
              <section className="discovery-section" aria-labelledby="discovery-dishes-title">
                <div className="discovery-section-heading">
                  <div>
                    <p className="discovery-eyebrow">A little inspiration</p>
                    <h2 id="discovery-dishes-title">What are you craving?</h2>
                  </div>
                  <span className="discovery-section-aside">Fresh picks from food partners</span>
                </div>
                <div className="discovery-dishes">
                  {dishes.slice(0, 6).map((food) => (
                    <button
                      className="discovery-dish"
                      type="button"
                      key={food._id}
                      aria-pressed={searchQuery === food.name}
                      onClick={() => {
                        setSearchQuery((current) => current === food.name ? '' : food.name)
                        setLocation('')
                      }}
                    >
                      <span className="discovery-dish-media">
                        <video
                          src={food.video}
                          poster={foodPoster(food)}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          aria-hidden="true"
                        />
                        <span className="discovery-dish-media-shade" aria-hidden="true" />
                      </span>
                      <span className="discovery-dish-label">{food.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="discovery-section" aria-labelledby="discovery-restaurants-title">
              <div className="discovery-section-heading">
                <div>
                  <p className="discovery-eyebrow">Discover local kitchens</p>
                  <h2 id="discovery-restaurants-title">Food partners to explore</h2>
                </div>
                {visibleRestaurants.length > 0 && (
                  <span className="discovery-result-count">
                    {visibleRestaurants.length} {visibleRestaurants.length === 1 ? 'partner' : 'partners'}
                  </span>
                )}
              </div>

              {error ? (
                <p className="discovery-state discovery-state--error" role="alert">{error}</p>
              ) : isLoading ? (
                <p className="discovery-state" role="status">Loading food partners…</p>
              ) : visibleRestaurants.length > 0 ? (
                <div className="discovery-restaurants">
                  {visibleRestaurants.map((restaurant) => {
                    const food = restaurant.foods[0]
                    return (
                      <article className="discovery-restaurant-card" key={restaurant.id}>
                        <Link className="discovery-restaurant-media" to={storeHref(restaurant, food)} aria-label={`Visit ${restaurant.name}`}>
                          <video
                            src={food.video}
                            poster={foodPoster(food)}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            aria-hidden="true"
                          />
                          <span className="discovery-media-tag">Food reel</span>
                        </Link>
                        <div className="discovery-restaurant-copy">
                          <div className="discovery-restaurant-heading">
                            <h3>{restaurant.name}</h3>
                            <span className="discovery-food-count">
                              {restaurant.foods.length} {restaurant.foods.length === 1 ? 'video' : 'videos'}
                            </span>
                          </div>
                          {restaurant.address && <p className="discovery-address">{restaurant.address}</p>}
                          <p className="discovery-dish-name">{food.name}</p>
                          {(restaurant.rating || restaurant.cuisine || restaurant.price || restaurant.deliveryTime) && (
                            <div className="discovery-restaurant-meta">
                              {restaurant.rating && (
                                <span className="discovery-rating">
                                  <span aria-hidden="true">★</span> {restaurant.rating}
                                </span>
                              )}
                              {restaurant.cuisine && <span>{restaurant.cuisine}</span>}
                              {restaurant.price && <span>{formatPrice(restaurant.price)}</span>}
                              {restaurant.deliveryTime && (
                                <span>
                                  {typeof restaurant.deliveryTime === 'number'
                                    ? `${restaurant.deliveryTime} min`
                                    : restaurant.deliveryTime}
                                </span>
                              )}
                            </div>
                          )}
                          <Link to={storeHref(restaurant, food)}>
                            Visit store <span aria-hidden="true">↗</span>
                          </Link>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="discovery-state">
                  <h3>{restaurants.length ? 'No matching food partners' : 'No food partners to show yet'}</h3>
                  <p>
                    {restaurants.length
                      ? 'Try another search or choose a different location.'
                      : 'Partner stores will appear here when food videos are available.'}
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <BottomNavigation />
    </main>
  )
}

export default Home
