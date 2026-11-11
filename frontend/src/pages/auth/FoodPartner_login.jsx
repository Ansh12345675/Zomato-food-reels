import AuthPage from '../../components/AuthPage'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postApi } from '../../lib/api'

function FoodPartnerLogin() {
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback(null)

    try {
      await postApi('/auth/food-partners/login', {
        email: event.currentTarget.email.value.trim(),
        password: event.currentTarget.password.value,
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
    <AuthPage
      role="partner"
      mode="login"
      onSubmit={handleSubmit}
      feedback={feedback}
      isSubmitting={isSubmitting}
    />
  )
}

export default FoodPartnerLogin
