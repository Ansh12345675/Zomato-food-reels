import AuthPage from '../../components/AuthPage'

function Register({ role = 'user' }) {
  return <AuthPage role={role} mode="register" />
}

export default Register
