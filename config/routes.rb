Rails.application.routes.draw do
  root 'elements#new'
  resources :pages
  resources :elements
  resources :users

end
