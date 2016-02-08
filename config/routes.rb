Rails.application.routes.draw do
  root 'elements#change'
  resources :pages
  resources :elements
  resources :users

end
