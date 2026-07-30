// src/utils/fetchFromWP.ts
export async function fetchFromWP<T>(endpoint: string): Promise<T> {
		const base = process.env.NEXT_PUBLIC_WP_API_URL;
		const res = await fetch(`${base}${endpoint}`);
		if (!res.ok) throw new Error("Error to fetch data from WordPress");
		return res.json();
	}
