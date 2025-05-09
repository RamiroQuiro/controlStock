import jwt from 'jsonwebtoken';

const getToken = (payload: any) => {
  return jwt.sign(
    {
      data: payload,
    },
    import.meta.env.SECRET_KEY_TOKKENJWT,
    {
      expiresIn: '2h',
    }
  );
};

const getTokenData = (token: any) => {
  let data = null;
  jwt.verify(token, import.meta.env.SECRET_KEY_TOKKENJWT, (err, decoded) => {
    if (err) {
      console.log('Error al obtener data del token');
    } else {
      data = decoded;
    }
  });
  return data;
};

export { getToken, getTokenData };
