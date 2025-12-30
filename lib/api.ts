const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://psiarze-backend.onrender.com/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

// Map common error messages to Polish
const ERROR_TRANSLATIONS: Record<string, string> = {
  "Invalid credentials": "Nieprawidłowy email lub hasło",
  "Invalid email or password": "Nieprawidłowy email lub hasło",
  "User not found": "Użytkownik nie istnieje",
  "User already exists": "Użytkownik o tym emailu już istnieje",
  "Email already registered": "Ten email jest już zarejestrowany",
  "Username already taken": "Ta nazwa użytkownika jest już zajęta",
  "Password too short": "Hasło jest za krótkie",
  "Invalid email format": "Nieprawidłowy format emaila",
  "Not authenticated": "Musisz być zalogowany",
  "Unauthorized": "Brak autoryzacji",
  "Token expired": "Sesja wygasła, zaloguj się ponownie",
  "Invalid token": "Nieprawidłowy token, zaloguj się ponownie",
  "Friend request already exists": "Zaproszenie do znajomych już istnieje",
  "Cannot send friend request to yourself": "Nie możesz wysłać zaproszenia do siebie",
  "Friend request not found": "Zaproszenie do znajomych nie istnieje",
  "Room not found": "Pokój czatu nie istnieje",
  "Cannot create room with yourself": "Nie możesz utworzyć czatu sam ze sobą",
};

function translateError(message: string): string {
  // Check for exact match
  if (ERROR_TRANSLATIONS[message]) {
    return ERROR_TRANSLATIONS[message];
  }
  
  // Check for partial matches (case insensitive)
  const lowerMessage = message.toLowerCase();
  for (const [key, translation] of Object.entries(ERROR_TRANSLATIONS)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return translation;
    }
  }
  
  // Handle validation errors from FastAPI
  if (message.includes("field required") || message.includes("is required")) {
    return "Wypełnij wszystkie wymagane pola";
  }
  if (message.includes("not a valid email")) {
    return "Nieprawidłowy format emaila";
  }
  if (message.includes("ensure this value has at least")) {
    return "Wartość jest za krótka";
  }
  
  // Return original if no translation found
  return message;
}

export async function apiClient<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers, ...customConfig } = options;
  
  const config: RequestInit = {
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      let errorMessage = errorBody.detail || `Błąd: ${response.status}`;
      
      if (typeof errorMessage !== 'string') {
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        } else {
          errorMessage = JSON.stringify(errorMessage);
        }
      }
      
      // Translate the error message to Polish
      errorMessage = translateError(errorMessage);
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('API Call Failed:', error);
    throw error;
  }
}
