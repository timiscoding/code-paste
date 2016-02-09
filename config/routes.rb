Rails.application.routes.draw do
  root 'pages#index'
  resources :pages
  resources :elements
  resources :users

end
