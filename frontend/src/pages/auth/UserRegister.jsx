import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../components/AuthPage.css'
import { postApi } from '../../lib/api'

function UserRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
    setFeedback(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (form.password.length < 8) {
      setFeedback({
        type: 'error',
        message: 'Password must be at least 8 characters.',
      })
      return
    }

    if (form.password !== form.confirmPassword) {
      setFeedback({
        type: 'error',
        message: 'Passwords do not match.',
      })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      await postApi('/auth/users/register', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/', { replace: true })
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
      <section className="auth-card" aria-label="Create a food lover account">
        <aside className="auth-aside">
          <Link className="brand" to="/user/login" aria-label="Zomato home">
            <span className="brand-mark" aria-hidden="true">
              z
            </span>
            <span>zomato</span>
          </Link>

          <div className="aside-copy">
            <span className="eyebrow">A little joy, delivered</span>
            <h1>
              Good food,
              <br />
              good mood.
            </h1>
            <p>
              Discover the best places around you and find your next favourite.
            </p>
          </div>

          <div className="aside-note">
            <span className="note-icon" aria-hidden="true">
              ✳
            </span>
            <span>Something delicious is never far away.</span>
          </div>
          <div className="aside-decoration" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </aside>

        <div className="auth-content">
          <div className="auth-topline">
            <span>Welcome to zomato</span>
            <Link className="role-switch" to="/food-partner/login">
              Partner with us <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="auth-form-wrap">
            <div className="form-heading">
              <span className="form-kicker">GET STARTED</span>
              <h2>Create your account</h2>
              <p>Join as a food lover in just a few steps.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="form-field" htmlFor="user-full-name">
                <span>Full name</span>
                <input
                  id="user-full-name"
                  name="fullName"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="form-field" htmlFor="user-email">
                <span>Email address</span>
                <input
                  id="user-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="form-field" htmlFor="user-password">
                <span>Password</span>
                <input
                  id="user-password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="form-field" htmlFor="user-confirm-password">
                <span>Confirm password</span>
                <input
                  id="user-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
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
                  {feedback.type === 'success' && (
                    <>
                      {' '}
                      <Link to="/user/login">Sign in</Link>
                    </>
                  )}
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
              Already have an account? <Link to="/user/login">Sign in</Link>
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

export default UserRegister
