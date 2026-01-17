interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  name?: string;
  twoFactorAuthenticationCode?: string;

  address?: {
    street: string;
    city: string;
  };
}

export default User;
