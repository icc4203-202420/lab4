require 'sinatra'
require 'jwt'

SECRET_KEY = 'mysecretkey'

USERS = {
  "test@example.com" => {
    password: "password",
    wallet: { balance: 1000 }
  }
}

helpers do
  def encode_token(payload)
    JWT.encode(payload, SECRET_KEY, 'HS256')
  end

  def decode_token(token)
    JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })[0]
  rescue
    nil
  end

  def authorized_user
    auth_header = request.env['HTTP_AUTHORIZATION']
    token = auth_header.split(' ').last if auth_header
    decoded_token = decode_token(token)
    if decoded_token
      email = decoded_token['sub']
      USERS[email]
    end
  end

  def authorized?
    !!authorized_user
  end

  def protected!
    halt 401, 'Access Denied' unless authorized?
  end
end

post '/login' do
  email = params[:email]
  password = params[:password]
  user = USERS[email]
  if user && user[:password] == password
    token = encode_token({ sub: email, exp: (Time.now + 60 * 60).to_i })
    { token: token }.to_json
  else
    halt 401, 'Invalid credentials'
  end
end

get '/wallet' do
  protected!
  user = authorized_user
  user[:wallet].to_json
end

run! if app_file == $0
