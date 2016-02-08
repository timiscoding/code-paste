Rails.application.routes.draw do
  root 'pages#change'
  resources :pages
  resources :elements
  resources :users

end
