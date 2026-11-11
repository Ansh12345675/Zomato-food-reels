import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { postApi } from '../../lib/api'
import '../../components/AuthPage.css'

function FoodPartnerRegister() {
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const contactName = formData.get('contactName').trim()

    setIsSubmitting(true)
    setFeedback(null)

    try {
      await postApi('/auth/food-partners/register', {
        name: formData.get('restaurantName').trim(),
        ContactName: contactName,
        phone: formData.get('phone').trim(),
        address: formData.get('address').trim(),
        email: formData.get('email').trim(),
        password: formData.get('password'),
      })
      navigate('/food-partner/profile')
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof TypeError
            ? 'Could not connect to the server. Please make sure the backend is running and try again.'
            : error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-label="Food partner registration">
        <aside className="auth-aside auth-aside--partner">
          <Link className="brand" to="/" aria-label="Zomato home">
            <span className="brand-mark" aria-hidden="true">
              z
            </span>
            <span>zomato</span>
          </Link>

          <div className="aside-copy">
            <span className="eyebrow">For restaurants</span>
            <h1>
              Your kitchen.
              <br />
              More tables.
            </h1>
            <p>Meet new customers and grow your restaurant with every order.</p>
          </div>

          <div className="aside-note">
            <span className="note-icon" aria-hidden="true">
              ↗
            </span>
            <span>Made for the people behind great food.</span>
          </div>
          <div className="aside-decoration" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </aside>

        <div className="auth-content">
          <div className="auth-topline">
            <span>Partner portal</span>
            <Link className="role-switch" to="/user/login">
              Order food <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="auth-form-wrap">
            <div className="form-heading">
              <span className="form-kicker">GET STARTED</span>
              <h2>Register your restaurant</h2>
              <p>Share your restaurant and contact details to get started.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="form-field" htmlFor="partner-contact-name">
                <span>Contact name</span>
                <input
                  id="partner-contact-name"
                  name="contactName"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  autoComplete="name"
                  required
                />
              </label>

              <label className="form-field" htmlFor="restaurant-name">
                <span>Restaurant name</span>
                <input
                  id="restaurant-name"
                  name="restaurantName"
                  type="text"
                  placeholder="The name of your restaurant"
                  autoComplete="organization"
                  required
                />
              </label>

              <label className="form-field" htmlFor="partner-email">
                <span>Email address</span>
                <input
                  id="partner-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="form-field" htmlFor="partner-phone">
                <span>Contact number</span>
                <input
                  id="partner-phone"
                  name="phone"
                  type="tel"
                  placeholder="Your restaurant contact number"
                  autoComplete="tel"
                  required
                />
              </label>

              <label className="form-field" htmlFor="partner-address">
                <span>Restaurant address</span>
                <input
                  id="partner-address"
                  name="address"
                  type="text"
                  placeholder="Street, city, and postal code"
                  autoComplete="street-address"
                  required
                />
              </label>

              <label className="form-field" htmlFor="partner-password">
                <span>Password</span>
                <input
                  id="partner-password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>

              {feedback && (
                <p
                  className={`auth-feedback auth-feedback--${feedback.type}`}
                  role={feedback.type === 'error' ? 'alert' : 'status'}
                  aria-live="polite"
                >
                  {feedback.message}
                </p>
              )}

              <button
                className="primary-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
                {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{' '}
              <Link to="/food-partner/login">Sign in</Link>
            </p>
          </div>

          <p className="legal-note">
            By continuing, you agree to our <a href="#terms">Terms</a> and{' '}
            <a href="#privacy">Privacy Policy</a>.
          </p>
        </div>
      </section>
    </main>
  )
}

export default FoodPartnerRegister
