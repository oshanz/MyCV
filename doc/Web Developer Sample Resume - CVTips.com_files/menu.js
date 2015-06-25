$(document).ready(function() {
		$('ul.navigation li:has(ul)').hover(
			function(e)
			{
			       $(this).find('ul').show();
			       $(this).find('ul').css('z-index', 300);	/** 2010/11/09 */
                               if($(this).hasClass('active')) {
                                  $(this).removeClass('active');
                                  $(this).addClass('activeli');
                                  $(this).find('ul').addClass('activemenu'); 
                              }
                               
			},
			function(e)
			{
			      $(this).find('ul').hide();
			       $(this).find('ul').css('z-index', 0);	/** 2010/11/09 */
		               if($(this).hasClass('activeli')) {
                                   $(this).removeClass('activeli');
                                  $(this).addClass('active');
                                   $(this).find('ul').removeClass('activemenu');
                          } 
                        }
		);
});
