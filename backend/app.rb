require 'sinatra/base'
require 'sinatra/cross_origin'
require 'jwt'
require 'sinatra/json'
require 'sinatra/reloader'

class Backend < Sinatra::Base
  set :json_content_type, :json

  before do
    if request.content_type == 'application/json'
      begin
        # Leer y parsear el cuerpo de la solicitud solo una vez, sin usar `rewind`
        body = request.body.read
        @request_payload = JSON.parse(body) unless body.empty?
        params.merge!(@request_payload) if @request_payload
      rescue JSON::ParserError => e
        halt 400, { error: "Invalid JSON format: #{e.message}" }.to_json
      end
    end
    response.headers['Access-Control-Allow-Origin'] = '*'
  end

  configure do
    enable :cross_origin
  end

  SECRET_KEY = 'mysecretkey'

  USERS = {
    "user1@miuandes.cl" => {
      name: "Juan",
      password: "password1",
      favorites: ['Talca', 'Arica', 'Calama']
    },
    "user2@miuandes.cl" => {
      name: "Pedro",
      password: "password2",
      favorites: ['Temuco', 'Valdivia', 'Coyhaique']
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

  # Maneja la solicitud OPTIONS
  options '*' do
    response.headers['Allow'] = 'HEAD,GET,POST,PUT,PATCH,DELETE,OPTIONS'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'HEAD,GET,POST,PUT,PATCH,DELETE,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept'
    200
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

  post '/favorites' do
    protected!
    user = authorized_user

    if params[:favorites]
      user[:favorites] = params[:favorites]
      puts "User #{user[:name]} updated favorites to: #{user[:favorites]}"
    else
      puts "No valid favorites received"
      puts "User #{user[:name]} tried to update favorites with invalid data"
    end
  end

  get '/favorites' do
    protected!
    user = authorized_user
    puts "User #{user[:name]} accessed favorites: #{user[:favorites]}"
    { favorites: user[:favorites] || [] }.to_json
  end

  get '/verify-token' do
    protected!
    200
  end

  # Inicia la aplicación si se está ejecutando directamente
  run! if app_file == $0
end
