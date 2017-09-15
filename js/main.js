document.addEventListener('DOMContentLoaded', function() {
  
  TVShowsModule.init();
  
  TVShowsModule.searchToogleHandler('.search-toggle', '.search-content', false);
  
  TVShowsModule.searchToogleHandler('.search-close', '.search-content', true);
  
  TVShowsModule.findHandler();
  
  TVShowsModule.browesToggleHandler('.browes', '.browes-nav');
  
});