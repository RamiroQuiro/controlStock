
import type { APIContext } from "astro";
import { lucia } from "../../../lib/auth";

export async function POST(context: APIContext): Promise<Response> {

	
	const sessionCookie = lucia.createBlankSessionCookie();
	context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

	return context.redirect("/login");
}