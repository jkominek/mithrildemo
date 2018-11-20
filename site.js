var Index = {
    view: function() {
	return m('ul',
		 lorem.map(function(v, i) {
		     return m('li',
			      m('a', {href:"/article/"+i,oncreate:m.route.link},
				i),
			      " ",
			      v.substr(0, 20)+"...")
		 }))
    }
}

var Submit = {
    view: function() {
	var textarea = m('textarea');
	return m('div', [
	    textarea,
	    m('button', {
		onclick: function() {
		    lorem.push(textarea.dom.value);
		    m.route.set("/index");
		}
	    },
	      "Submit!"
	     )
	]);
    }
}

var FAQ = {
    view: function() {
	return [
	    m('div',
	      "So far, all zero questions which have been asked were frequently asked. Including every question in the FAQ is too many, and so, none of them have been included. Alas.")
	];
    }
}

var Support = {
    view: function() {
	var url = 'http://github.com/jkominek/mithrildemo';
	return [
	    m('div',
	      "See the github page for this, which probably something like",
	      m('a', {href:url}, url),
	      ".")
	]
    }
}

var About = {
    view: function() {
	return m('div',
		 "This is a demo of making a single page app with Mithril. It was written by Jay Kominek, with style inspired by Hacker News.");
    }
}

var Legal = {
    view: function() {
	return m('div',
		 "Hopefully everything here is MIT licensed:",
		 m('div', 'Mithril says it is MIT licensed. Good.'),
		 m('div', 'The little cog icon said it was MIT licensed. Good.'),
		 m('div', 'The stuff Jay wrote is definitely MIT licensed. Good.'),
		 "That about covers it?")
    }
}

var Contact = {
    view: function() {
	return m('div', "Jay can be contacted at kominek@gmail.com")
    }
}

var searchString = '';
var searchResults = null;
var Search = {
    view: function() {
	var rendered_results = "";
	if(searchResults) {
	    rendered_results = searchResults.map(function(v) {
		return m('div',
			 m('a', {
			     href: "/article/"+v,
			     oncreate: m.route.link
			 }, v)
			)});
	}
	var input = m('input', {type:'text', value:searchString});
	function handler() {
	    searchString = input.dom.value;
            searchResults = [ ];
	    lorem.map(function(v, i) {
		if(v.toLowerCase().indexOf(searchString.toLowerCase())>=0) {
		    searchResults.push(i);
		}
	    });
	};
	input.attrs["onchange"] = handler;
	x = m('div',
	      "search:",
	      input,
	      m('button',
		{onclick: handler},
		"Search"
	       ),
	      rendered_results
	     );
	return x;
    }
}

var Article = {
    view: function() {
	var id = m.route.param("id");
	return m('div', lorem[id]);
    }
}

/* User state management */

var loggedInAs = false;

var Logout = {
    view: function() {
	loggedInAs = false;
	m.redraw();
	return "logged out"
    }
}

/* if the auth_required function catches a route request and
 * redirects it to the login screen, it'll store the requested
 * route here, and Login will send us there upon success.
 */
var desiredPathAwaitingAuth = null;

var Login = {
    view: function() {
	var username = m('input', {type: 'text'});
	function handler() {
	    loggedInAs = username.dom.value;
	    if(desiredPathAwaitingAuth) {
		m.route.set(desiredPathAwaitingAuth);
		desiredPathAwaitingAuth = null;
	    } else {
		m.route.set("/index");
	    }
	}
	username.attrs["onchange"] = handler;
	console.log(username);
	x = m('div', [
	    m('div', ['username:', username]),
	    m('button', { onclick: handler }, "Log In")
	]);
	return x;
    }
}

/* Renders a little bit in the menu bar about the logged in user */
var UserStatus = {
    view: function() {
	if(!loggedInAs) {
	    return m('a', {id:"login", href:"/login", oncreate:m.route.link},
		     "login")
	}
	return [
	    m('a', {id:"me",
		    href:"/userinfo",
		    oncreate:m.route.link},
	      loggedInAs),
	    " | ",
	    m('a', {id:"logout",
		    href:"/logout",
		    oncreate:m.route.link},
	      "logout")
	];
    }
}

/* wraps views with an onmatch rule that requires the
 * user be logged in, however that might be determined.
 * failure stores the requested path and redirects to
 * the /login route.
 */
function auth_required(destination) {
    return {
	onmatch: function(params, requestedPath) {
	    if(loggedInAs)
		return destination;
	    else {
		desiredPathAwaitingAuth = requestedPath;
		m.route.set("/login");
	    }
	}
    };
}

/* Set up Mithril mounts and such on content load */

document.addEventListener("DOMContentLoaded", function() {
    m.mount(document.getElementById("userstatus"), UserStatus);
    m.route(document.getElementById('content'), "/index", {
	"/index": auth_required(Index),
	"/submit": auth_required(Submit),
	"/faq": FAQ,
	"/support": Support,
	"/about": About,
	"/legal": Legal,
	"/contact": Contact,
	"/search": auth_required(Search),
	"/article/:id": auth_required(Article),
	
	"/login": Login,
	"/logout": auth_required(Logout),
    });
    console.log("go!");
});
