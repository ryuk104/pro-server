declare global {
	namespace Express {
		interface Request {
			user: any;
			user_id: any;
			token: any;
		}
	}
}
