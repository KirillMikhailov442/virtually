import { NextRequest, NextResponse } from 'next/server';

export const middleware = (req: NextRequest) => {
  const userCookie = req.cookies.get('user')?.value;

  if (!userCookie) {
    const url = new URL('/login', req.url);
    url.searchParams.set('from', req.nextUrl);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
};
export const config = {
  matcher: ['/', '/rooms/:id'],
};
