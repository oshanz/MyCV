y.Register( "Community", ( function() {
    var community = {
        "MemberName": ""
    };
    var thread_content_selector = ".js-community-content";
    var created_time_selector = ".js-community-time_created";
    var updated_time_selector = ".js-community-time_updated";
    var author_image_selector = ".js-community-authorship_image";
    var interests_selector = ".js-community-interests";
    var fade_speed = 500;

    var ThreadModel = Backbone.Model.extend( {} );
    var ThreadMainView = Backbone.View.extend( {
        "ReplyAreaView": null,
        "events": {
            "click .js-community-reply_button": "ScrollToReplyArea",
            "click .js-community-report": "Report",
            "click .js-community-edit": "StartEdit",
            "click .js-community-delete": "Delete",
            "click .js-community-toggle_anonymity": "ToggleAnonymity",
            "click .js-community-vote_button": "Vote"
        },

        "initialize": function() {
            var content_element = this.$( thread_content_selector );
            var cleaner = $( "<div>" + this.model.get( "Content" ) + "</div>" );
            content_element.html( autolinker.link( cleaner.html() ) );
            y.Menu.DropdownInit( this.$( ".js-tray_button" ), this.$( ".js-post_menu" ) );
            community.SetTime( this.$el );

            y.TruncateElements( this.$( interests_selector ) );
        },

        "CancelEdit": function( e ) {
            e.preventDefault();
            this.$el.empty().append( this.post_html );
        },

        "Delete": function( e ) {
            e.preventDefault();
            y.Menu.Close();

            this.$el.parent( ".js-community-thread_container" ).empty().html( "This thread has been deleted" );

            y.Util.Post( "/thread/delete", {
                "ThreadId": this.model.get( "Id" ),
                "ItemType": "THREAD"
            } );
        },

        "Report": function( e ) {
            e.preventDefault();
            y.Menu.Close();

            $( e.target ).html( "Reported" );

            y.Util.Post( "/thread/report", {
                "ThreadId": this.model.get( "Id" ),
                "ItemType": "THREAD"
            } );
        },

        "SaveEdit": function( e ) {
            e.preventDefault();
            $( e.target ).trigger( "in_progress" );
            var content = y.RichTextEditor.GetContent( "edit_thread" );
            var interest_ids = y.Community.InterestEditor.Get( "edit_thread" );
            var name = this.$( ".js-community-thread_edit_title" ).val();

            var self = this;
            y.Util.Post( "/thread/update", {
                "Id": this.model.get( "Id" ),
                "Name": name,
                "Content": content,
                "DiscussedEntities": interest_ids
            } ).done( function( result ) {
                $( e.target ).trigger( "progress_complete" );

                if( result && result.result.IsCaiFailure ) {
                    _.each( result.result.FailureItems, processThreadErrors );
                    return;
                }

                var editor_interests = self.$( ".js-community-interest_editor-interest" ).clone();

                self.$el.empty().append( self.post_html );
                self.$( ".js-community-interests" ).empty();
                self.$( thread_content_selector ).html( content );

                editor_interests.each( function( i, elem ) {
                    var interest_data = interest_ids[i];
                    elem = $( elem );
                    self.$( ".js-community-interests" ).append( "<li class='horizontal_list--item' data-id='" + interest_data.Id + "' data-type='" + interest_data.Type + "' data-name='" + interest_data.Name + "'><a class='tag'>" + interest_data.Name + "</a></li>" );
                } );

                y.TruncateElements( self.$( interests_selector ) );
            } );
        },

        "ScrollToReplyArea": function( e ) {
            e.preventDefault();
            if( this.ReplyAreaView ) {
                this.ReplyAreaView.ScrollToReplyArea();
            }
        },

        "StartEdit": function( e ) {
            e.preventDefault();
            y.Menu.Close();

            var edit_area = $( _.template( $( ".js-community-thread_edit_template" ).html() )() );
            var content = this.$( thread_content_selector ).html();
            edit_area.find( ".js-community-thread_edit_title" ).val( this.model.get( "Name" ) );
            y.RichTextEditor.Init( edit_area.find( ".js-rich_text_editor" ), "edit_thread" );
            y.RichTextEditor.Set( "edit_thread", content );
            y.Community.InterestEditor.Init( edit_area.find( ".js-interest_editor" ), "edit_thread" );

            var interests = this.model.get( "EntityLinks" );

            y.Community.InterestEditor.Set( "edit_thread", interests );
            y.Community.PostAs.Init( edit_area.find( ".js-community-post_as" ) );
            y.RichTextEditor.Set( this.model.get( "Id" ) + "-edit", content );

            var self = this;
            edit_area.find( ".js-community-post_as-cancel" ).click( function( e ) {
                self.CancelEdit( e );
            } );
            edit_area.find( ".js-community-post_as-submit" ).click( function( e ) {
                self.SaveEdit( e );
            } );

            this.post_html = this.$el.children();
            this.post_html.detach();
            this.$el.append( edit_area );
        },

        "ToggleAnonymity": function( e ) {
            e.preventDefault();
            var message = "";

            if( y.Community.PostAs.Toggle() ) {
                y.Util.Post( "/thread/toggle-anonymity", {
                    "ThreadId": this.model.get( "Id" ),
                    "Anonymous": y.Community.PostAs.ThreadData.is_anonymous
                } );
                $( ".js-community-my_name" ).html( y.Community.PostAs.ThreadData.is_anonymous ? "Anonymous" : y.Community.MemberName );
            }
        },

        "Vote": function( e ) {
            e.preventDefault();

            if( $( e.target ).hasClass( "is-active" ) ) {
                $( e.target ).removeClass( "is-active" )
                y.Util.Post( "/thread/vote", {
                    "Action": "REMOVE",
                    "EntityId": this.model.get( "Id" ),
                    "EntityType": "THREAD"
                } );

                this.$( ".js-community-vote_count" ).text( parseInt( this.$( ".js-community-vote_count" ).text() ) - 1 );
            } else {
                $( e.target ).addClass( "is-active" )
                y.Util.Post( "/thread/vote", {
                    "Action": "ADD",
                    "EntityId": this.model.get( "Id" ),
                    "EntityType": "THREAD"
                } );

                this.$( ".js-community-vote_count" ).text( parseInt( this.$( ".js-community-vote_count" ).text() ) + 1 );
            }
        }
    } );

    var ThreadReplyAreaView = Backbone.View.extend( {
        "events": {
            "click .js-community-post_as-submit": "SubmitReply"
        },
        "initialize": function() {
            y.RichTextEditor.Init( this.$( ".js-rich_text_editor" ), this.model.get( "Id" ) );
            y.Community.PostAs.Init( this.$( ".js-community-post_as" ) );
        },
        "ScrollToReplyArea": function() {
            var self = this;
            $( "html, body" ).animate( {
                "scrollTop": self.$el.offset().top - ( $( window ).height() / 2 )
            }, 100 );
            $( "html, body" ).promise().done( function() {
                self.$( ".js-rich_text_editor-input" ).focus();
            } );
        },
        "SubmitReply": function( e ) {
            e.preventDefault();
            var id = this.model.get( "Id" );
            var is_anonymous = y.Community.PostAs.ThreadData.is_anonymous;
            var button = $( e.currentTarget );

            button.trigger( "in_progress" );

            community.SubmitReply( id, "", y.RichTextEditor.GetContent( id ), is_anonymous ).done( function( result ) {
                button.trigger( "progress_complete" );
                result = result.result;
                if( result && result.IsCaiFailure ) {
                    _.each( result.FailureItems, _.partial( processPostErrors, id ) );
                } else {
                    y.RichTextEditor.Clear( id );
                    var post_template = _.template( $( ".js-community-post_template" ).html() );
                    var rendered_template = $( post_template( result ) );
                    var post = rendered_template.find( ".js-community-post" );
                    var reply_area = rendered_template.find( ".js-community-reply_area" );
                    post.hide();
                    $( ".js-community-replies[data-owner_id='" + id + "']" ).append( post );

                    community.SetAuthorImage( post, result.Post.Post.Poster.PhotoPath );
                    community.CreatePostView( post, reply_area, result.Post.Post );

                    post.fadeIn( fade_speed );
                }
            } );
        }
    } );

    var PostModel = Backbone.Model.extend( {} );

    var PostMainView = Backbone.View.extend( {
        "events": {
            "click .js-community-reply_button": "OpenReplyArea",
            "click .js-community-report": "Report",
            "click .js-community-edit": "StartEdit",
            "click .js-community-delete": "Delete",
            "click .js-community-toggle_anonymity": "ToggleAnonymity",
            "click .js-community-vote_button": "Vote"
        },

        "initialize": function() {
            var content_element = this.$( thread_content_selector );
            var cleaner = $( "<div>" + this.model.get( "Content" ) + "</div>" );
            content_element.html( autolinker.link( cleaner.html() ) );
            y.Menu.DropdownInit( this.$( ".js-tray_button" ), this.$( ".js-post_menu" ) );
            community.SetTime( this.$el );
        },

        "CancelEdit": function( e ) {
            e.preventDefault();
            this.$el.empty().append( this.post_html );
        },

        "Delete": function( e ) {
            e.preventDefault();
            y.Menu.Close();

            this.$el.empty().html( "<div class='community-post'>This post was deleted</div><hr>" );

            y.Util.Post( "/thread/delete", {
                "ThreadId": this.model.get( "ThreadId" ),
                "PostId": this.model.get( "Id" ),
                "ItemType": "POST"
            } );
        },

        "OpenReplyArea": function( e ) {
            e.preventDefault();
            if( this.ReplyAreaView ) {
                this.ReplyAreaView.OpenReplyArea();
            }
        },

        "Report": function( e ) {
            e.preventDefault();
            y.Menu.Close();

            $( e.target ).html( "Reported" );

            y.Util.Post( "/thread/report", {
                "PostId": this.model.get( "Id" ),
                "ThreadId": this.model.get( "ThreadId" ),
                "ItemType": "POST"
            } );
        },

        "SaveEdit": function( e ) {
            e.preventDefault();
            $( e.target ).trigger( "in_progress" );
            var content = y.RichTextEditor.GetContent( this.model.get( "Id" ) + "-edit" );
            var self = this;

            y.Util.Post( "/thread/update_post", {
                "Id": this.model.get( "Id" ),
                "Content": content
            } ).done( function() {
                $( e.target ).trigger( "progress_complete" );
                self.$el.empty().append( self.post_html );
                self.$( thread_content_selector ).html( content );
            } );
        },

        "StartEdit": function( e ) {
            e.preventDefault();
            y.Menu.Close();

            var edit_area = $( _.template( $( ".js-community-edit_template" ).html() )() );
            var content = this.$( thread_content_selector ).html();
            y.RichTextEditor.Init( edit_area, this.model.get( "Id" ) + "-edit" );
            y.Community.PostAs.Init( edit_area.find( ".js-community-post_as" ) );
            y.RichTextEditor.Set( this.model.get( "Id" ) + "-edit", content );

            var self = this;
            edit_area.find( ".js-community-post_as-cancel" ).click( function( e ) {
                self.CancelEdit( e );
            } );
            edit_area.find( ".js-community-post_as-submit" ).click( function( e ) {
                self.SaveEdit( e );
            } );

            this.post_html = this.$el.children();
            this.post_html.detach();
            this.$el.append( edit_area );
        },

        "ToggleAnonymity": function( e ) {
            e.preventDefault();
            var message = "";

            if( y.Community.PostAs.Toggle() ) {
                y.Util.Post( "/thread/toggle-anonymity", {
                    "ThreadId": this.model.get( "ThreadId" ),
                    "Anonymous": y.Community.PostAs.ThreadData.is_anonymous
                } );
                $( ".js-community-my_name" ).html( y.Community.PostAs.ThreadData.is_anonymous ? "Anonymous" : y.Community.MemberName );
            }
        },

        "Vote": function( e ) {
            e.preventDefault();

            if( $( e.target ).hasClass( "is-active" ) ) {
                $( e.target ).removeClass( "is-active" )
                y.Util.Post( "/thread/vote", {
                    "Action": "REMOVE",
                    "EntityId": this.model.get( "Id" ),
                    "EntityType": "POST"
                } );

                this.$( ".js-community-vote_count" ).text( parseInt( this.$( ".js-community-vote_count" ).text() ) - 1 );
            } else {
                $( e.target ).addClass( "is-active" )
                y.Util.Post( "/thread/vote", {
                    "Action": "ADD",
                    "EntityId": this.model.get( "Id" ),
                    "EntityType": "POST"
                } );

                this.$( ".js-community-vote_count" ).text( parseInt( this.$( ".js-community-vote_count" ).text() ) + 1 );
            }
        }
    } );

    var PostReplyAreaView = Backbone.View.extend( {
        "events": {
            "click .js-community-post_as-submit": "SubmitReply",
            "click .js-community-post_as-cancel": "CloseReplyArea"
        },
        "initialize": function() {
            y.RichTextEditor.Init( this.$( ".js-rich_text_editor" ), this.model.get( "Id" ) );
            y.Community.PostAs.Init( this.$( ".js-community-post_as" ) );
        },
        "OpenReplyArea": function() {
            this.$el.slideDown( 100 );
        },
        "CloseReplyArea": function( e ) {
            if( e ) {
                e.preventDefault();
            }
            this.$el.hide();
            y.RichTextEditor.Clear( this.model.get( "Id" ) );
        },
        "SubmitReply": function( e ) {
            e.preventDefault();
            var id = this.model.get( "Id" );
            var thread_id = this.model.get( "ThreadId" );
            var is_anonymous = y.Community.PostAs.ThreadData.is_anonymous;
            var button = $( e.currentTarget );

            button.trigger( "in_progress" );
            this.$( ".js-can_error" ).trigger( "clear_errors" );

            var self = this;

            community.SubmitReply( thread_id, id, y.RichTextEditor.GetContent( id ), is_anonymous ).done( function( result ) {
                button.trigger( "progress_complete" );
                result = result.result;
                if( result && result.IsCaiFailure ) {
                    _.each( result.FailureItems, _.partial( processPostErrors, id ) );
                } else {
                    var post_template = _.template( $( ".js-community-post_template" ).html() );
                    var rendered_template = $( post_template( result ) );
                    var post = rendered_template.find( ".js-community-post" );

                    post.find( ".js-community-reply_button" ).remove();

                    post.hide();
                    $( ".js-community-replies[data-owner_id='" + id + "']" ).append( post );
                    community.SetAuthorImage( post, result.Post.Post.Poster.PhotoPath );
                    community.CreatePostView( post, null, result.Post.Post );

                    self.CloseReplyArea();

                    post.fadeIn( fade_speed );
                    $( "html, body" ).animate( {
                        "scrollTop": post.offset().top - ( $( window ).height() / 2 )
                    }, 100 );
                }
            } );
        }
    } );

    var URLS = {
        "create_thread": "/community/create-thread",
        "reply": "/community/reply"
    }

    var autolinker = new Autolinker( {
        "stripPrefix": false,
        "className": "underline",
        "twitter": false,
        "email": false,
        "phone": false,
        "replaceFn": function( autolinker, match ) {
            if( match.getType() === "url" ) {
                if( match.getMatchedText().toLowerCase() === "b.sc" ) {
                    return false;
                } else if( match.getUrl().indexOf( "yconic.com" ) === -1 ) {
                    var tag = autolinker.getTagBuilder().build( match );
                    tag.setAttr( "rel", "nofollow" );
                    return tag;
                } else {
                    return true;
                }
            }
        }
    } );

    function processThreadErrors( failure_item ) {
        if( failure_item.FailureMessage === "error-requires_name" ) {
            $( ".js-community-thread_edit_title" ).trigger( "error", "error-missing_name" );
            y.Markers.Add( "FEATURE", "EDIT_THREAD", "ERROR_MESSAGE_DISPLAYED", { "message": "error-missing_name" } );
        } else if( failure_item.FailureMessage === "error-requires_content" ) {
            y.RichTextEditor.Get( "edit_thread" ).trigger( "error", "error-no_content" );
            y.Markers.Add( "FEATURE", "EDIT_THREAD", "ERROR_MESSAGE_DISPLAYED", { "message": "error-no_content" } );
        } else if( failure_item.FailureMessage === "error-requires_discussed_entity" ) {
            y.Community.InterestEditor.GetElem( "edit_thread" ).trigger( "error", "error-must_have_one_discussed_entity" );
            y.Markers.Add( "FEATURE", "EDIT_THREAD", "ERROR_MESSAGE_DISPLAYED", { "message": "error-requires_discussed_entity" } );
        } else if( failure_item.FailureMessage === "spam_guidelines_violation" ) {
            y.RichTextEditor.Get( "edit_thread" ).trigger( "error", "error-spam_guidelines_violation" );
            y.Markers.Add( "FEATURE", "EDIT_THREAD", "ERROR_MESSAGE_DISPLAYED", { "message": "error-spam_guidelines_violation" } );
        } else if( failure_item.FailureMessage === "posting_too_fast" ) {
            y.RichTextEditor.Get( "edit_thread" ).trigger( "error", "error-too_fast" );
            y.Markers.Add( "FEATURE", "EDIT_THREAD", "ERROR_MESSAGE_DISPLAYED", { "message": "error-too_fast" } );
        }
    }

    function processPostErrors( id, failure_item ) {
        if( failure_item.FailureMessage === "Must have some content" ) {
            y.RichTextEditor.Get( id ).trigger( "error", "error-no_content" );
            y.Markers.Add( "FEATURE", "REPLY_TO_POST", "ERROR_MESSAGE_DISPLAYED", { "message": "error-no_content" } );
        } else if( failure_item.FailureMessage === "spam_guidelines_violation" ) {
            y.RichTextEditor.Get( id ).trigger( "error", "error-spam_guidelines_violation" );
            y.Markers.Add( "FEATURE", "REPLY_TO_POST", "ERROR_MESSAGE_DISPLAYED", { "message": "error-spam_guidelines_violation" } );
        } else if( failure_item.FailureMessage === "posting_too_fast" ) {
            y.RichTextEditor.Get( id ).trigger( "error", "error-posting_too_fast" );
            y.Markers.Add( "FEATURE", "REPLY_TO_POST", "ERROR_MESSAGE_DISPLAYED", { "message": "error-posting_too_fast" } );
        }
    }

    community.BindEventHandlers = function( element, id ) {
        element.find( ".js-community-reply_button" ).click( function() {
            $( ".js-community-reply_area[data-owner_id='" + id + "']" ).slideDown( 100 );
        } );
    }

    community.CreatePostView = function( main_element, reply_area, data ) {
        var model = new PostModel( data );
        var main_view = new PostMainView( { "el": main_element, "model": model } );
        if( reply_area ) {
            var reply_area_view = new PostReplyAreaView( { "el": reply_area, "model": model } );
            main_view.ReplyAreaView = reply_area_view;
        }
    }

    community.CreateThread = function( name, content, interest_ids, is_anonymous ) {
        var data = {
            "Name": name,
            "Content": content,
            "DiscussedEntities": interest_ids,
            "Is_anonymous": is_anonymous
        }

        return y.Util.Post( URLS.create_thread, data );
    }

    community.CreateThreadView = function( main_element, reply_area, data ) {
        var model = new ThreadModel( data );
        var main_view = new ThreadMainView( { "el": main_element, "model": model } );
        if( reply_area && reply_area.length > 0 ) {
            var reply_area_view = new ThreadReplyAreaView( { "el": reply_area, "model": model } );
            main_view.ReplyAreaView = reply_area_view;
        }
    }

    community.InitCreateThread = function( elem ) {
        y.Community.PostAs.Init( elem.find( $( ".js-community-post_as" ) ), true );
        elem.find( ".js-community-post_as-submit" ).click( function( e ) {
            e.preventDefault();
            $( ".js-search_bar_create_thread" ).find( ".js-can_error" ).trigger( "clear_errors" );
            $( e.target ).trigger( "in_progress" );

            var name = elem.find( ".js-create_thread_title" ).val();
            var content = y.RichTextEditor.GetContent( "create_thread" );
            var interest_ids = y.Community.InterestEditor.Get( "create_thread" );
            var is_anonymous = y.Community.PostAs.OverlayData.is_anonymous;

            y.Community.CreateThread( name, content, interest_ids, is_anonymous ).done( function( result ) {
                if( result && result.result.IsCaiFailure ) {
                    $( e.target ).trigger( "progress_complete" );
                    // Handle errors
                    _.each( result.result.FailureItems, function( item ) {
                        $( ".js-search_bar_create_thread" ).find( ".js-can_error" ).trigger( "error", item.FailureMessage );
                        y.Markers.Add( "FEATURE", "NEW_DISCUSSION_OVERLAY", "ERROR_MESSAGE_DISPLAYED", { "message": item.FailureMessage } );
                    } );
                } else {
                    window.location.href = "/discussion/" + y.Util.SanitizePath( name ) + "/" + result.result;
                }
            } );
        } );
    }

    community.SubmitReply = function( thread_id, parent_id, content, is_anonymous ) {
        var data = {
            "ThreadId": thread_id,
            "Content": content,
            "IsAnonymous": is_anonymous,
            "ParentId": parent_id
        }

        return y.Util.Post( URLS.reply, data );
    }

    community.SetAuthorImage = function( element, image_source ) {
        element.find( ".js-community-authorship_image" ).attr( "src", image_source );
    }

    community.SetTime = function( element ) {
        var created_time_element = element.find( created_time_selector );
        if( created_time_element.data( "time" ) ) {
            var date_string = y.Util.UnixToRelativeTime( Number( created_time_element.data( "time" ) ) );
            if( created_time_element.is( ":first-child" ) ) {
                created_time_element.html( date_string );
            } else {
                created_time_element.html( "&#8226;&nbsp;&nbsp;" + date_string );
            }

            var updated_time_element = element.find( updated_time_selector );
            if( updated_time_element.data( "time" ) && updated_time_element.data( "time" ) !== created_time_element.data( "time" ) ) {
                var date_string = y.Util.UnixToRelativeTime( Number( updated_time_element.data( "time" ) ) );
                updated_time_element.html( "&#8226;&nbsp;&nbsp;Edited: " + date_string );
            }
        }
    }

    return community;
} )() );
