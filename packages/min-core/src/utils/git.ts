import { execSync } from 'child_process'

export function getGitUser () {
  let name
  let email

  try {
    name = execSync('git config --get user.name')
    email = execSync('git config --get user.email')
  }
  catch (err) {
    //
  }

  name = name && name.toString().trim()
  email = email && (' <' + email.toString().trim() + '>')
  return (name || '') + (email || '')
}
