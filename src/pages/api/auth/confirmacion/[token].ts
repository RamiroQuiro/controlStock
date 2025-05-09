import type { APIRoute } from 'astro';
import { getTokenData } from '../../../../lib/confrmacionEmail';

export const GET: APIRoute = async ({ request, params }) => {
  const { token } = params;
  try {
    const data = getTokenData(token);
    console.log('esta es la verificacoin', data);
    if (!data) {
      return new Response({
        status: 400,
        message: 'error al obtener la data',
      });
    }
    if (restablecer) {
      const resetpass = new URL(`/resetpass/${email}`, request.url);
      return NextResponse.redirect(resetpass);
    }
    await connectDB();
    const userFind = await User.findOne({ email });
    if (!userFind) {
      return NextResponse.json({
        sucess: false,
        message: 'no se encontro usuario',
      });
    }
    userFind.status = 'VERIFIED';
    await userFind.save();
    const verifiedUrl = new URL('/verificado', request.url);
    return NextResponse.redirect(verifiedUrl);
  } catch (error) {}
  return NextResponse.json({ message: 'ramiro' });
};
