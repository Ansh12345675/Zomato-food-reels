import { Link } from 'react-router-dom'
import './AuthPage.css'

const paths = {
  user: {
    login: '/user/login',
    register: '/user/register',
  },
  partner: {
    login: '/food-partner/login',
    register: '/food-partner/register',
  },
}

function AuthPage({ role, mode, onSubmit, feedback, isSubmitting = false }) {
  const isPartner = role === 'partner'
  const isRegister = mode === 'register'
  const roleName = isPartner ? 'food partner' : 'food lover'
  const fields = isRegister
    ? [
        {
          name: 'name',
          label: isPartner ? 'Your name' : 'Full name',
          type: 'text',
          placeholder: isPartner ? 'e.g. Alex Morgan' : 'e.g. Alex Morgan',
          autoComplete: 'name',
        },
        ...(isPartner
          ? [
              {
                name: 'restaurant',
                label: 'Restaurant name',
                type: 'text',
                placeholder: 'The name of your restaurant',
                autoComplete: 'organization',
              },
            ]
          : []),
        {
          name: 'email',
          label: 'Email address',
          type: 'email',
          placeholder: 'you@example.com',
          autoComplete: 'email',
        },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          placeholder: 'At least 8 characters',
          autoComplete: 'new-password',
        },
      ]
    : [
        {
          name: 'email',
          label: 'Email address',
          type: 'email',
          placeholder: 'you@example.com',
          autoComplete: 'email',
        },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          placeholder: 'Enter your password',
          autoComplete: 'current-password',
        },
      ]

  const oppositeMode = isRegister ? 'login' : 'register'
  const switchPath = paths[role][oppositeMode]

  return (
    <main className="auth-page">
      <section className="auth-card" aria-label={`${roleName} ${mode}`}>
        <aside className={`auth-aside${isPartner ? ' auth-aside--partner' : ''}`}>
          <Link className="brand" to="/" aria-label="Zomato home">
            <span className="brand-mark" aria-hidden="true">
              z
            </span>
            <span>zomato</span>
          </Link>

          <div className="aside-copy">
            <span className="eyebrow">
              {isPartner ? 'For restaurants' : 'A little joy, delivered'}
            </span>
            <h1>
              {isPartner ? (
                <>
                  Your kitchen.
                  <br />
                  More tables.
                </>
              ) : (
                <>
                  Good food,
                  <br />
                  good mood.
                </>
              )}
            </h1>
            <p>
              {isPartner
                ? 'Meet new customers and grow your restaurant with every order.'
                : 'Discover the best places around you and find your next favourite.'}
            </p>
          </div>

          <div className="aside-note">
            <span className="note-icon" aria-hidden="true">
              {isPartner ? '↗' : '✳'}
            </span>
            <span>
              {isPartner
                ? 'Made for the people behind great food.'
                : 'Something delicious is never far away.'}
            </span>
          </div>
          <div className="aside-decoration" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </aside>

        <div className="auth-content">
          <div className="auth-topline">
            <span>{isPartner ? 'Partner portal' : 'Welcome to zomato'}</span>
            <Link
              className="role-switch"
              to={isPartner ? '/user/login' : '/food-partner/login'}
            >
              {isPartner ? 'Order food' : 'Partner with us'}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="auth-form-wrap">
            <div className="form-heading">
              <span className="form-kicker">
                {isRegister ? 'GET STARTED' : 'WELCOME BACK'}
              </span>
              <h2>{isRegister ? 'Create your account' : 'Sign in'}</h2>
              <p>
                {isRegister
                  ? `Join as a ${roleName} in just a few steps.`
                  : `Sign in to your ${roleName} account.`}
              </p>
            </div>

            <form className="auth-form" onSubmit={onSubmit}>
              {fields.map((field) => (
                <label className="form-field" key={field.name} htmlFor={field.name}>
                  <span>{field.label}</span>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    required
                    minLength={field.name === 'password' && isRegister ? 8 : undefined}
                  />
                </label>
              ))}

              {!isRegister && (
                <div className="form-options">
                  <label className="remember-option">
                    <input type="checkbox" name="remember" />
                    <span>Remember me</span>
                  </label>
                  <button className="text-button" type="button">
                    Forgot password?
                  </button>
                </div>
              )}

              {feedback && (
                <p
                  className={`auth-feedback auth-feedback--${feedback.type}`}
                  role={feedback.type === 'error' ? 'alert' : 'status'}
                  aria-live="polite"
                >
                  {feedback.message}
                </p>
              )}

              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Please wait...'
                  : isRegister
                    ? 'Create account'
                    : 'Sign in'}
                {!isSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <p className="auth-switch">
              {isRegister ? 'Already have an account?' : 'New to zomato?'}{' '}
              <Link to={switchPath}>
                {isRegister ? 'Sign in' : 'Create an account'}
              </Link>
            </p>

            <div className="auth-divider">
              <span />
              <span>or continue with</span>
              <span />
            </div>

            <button className="google-button" type="button">
              <svg
                className="google-mark"
                aria-hidden="true"
                viewBox="0 0 18 18"
                focusable="false"
              >
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.61Z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.47-.81 5.96-2.19l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.59-5.05-3.73H.94v2.33A9 9 0 0 0 9 18Z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.95 10.68A5.4 5.4 0 0 1 3.67 9c0-.58.1-1.14.28-1.68V4.99H.94A9 9 0 0 0 0 9c0 1.45.35 2.82.94 4.01l3.01-2.33Z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.59c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .94 4.99l3.01 2.33C4.66 5.18 6.65 3.59 9 3.59Z"
                />
              </svg>
              Continue with Google
            </button>
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

export default AuthPage
