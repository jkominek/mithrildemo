var Index = {
    view: function() {
	var items = 
	    lorem.map(function(v, i) {
		return m('li',
			 m('a', {href:"/article/"+i,oncreate:m.route.link},
			   i),
			 " ",
			 v.substr(0, 20)+"...")
	    });
	return m('ul', items);
    }
}

var Submit = {
    view: function() {
	var textarea = m('textarea');
	return m('div', [
	    textarea,
	    m('br'),
	    m('button', {
		onclick: function() {
		    lorem.push(textarea.dom.value);
		    m.route.set("/index");
		}
	    }, "Submit!")
	]);
    }
}

// Lots of other ways you could do these bits of static content.
var FAQ = {
    view: function() {
	return m('div', [
	    "So far, all zero questions which have been asked were frequently asked. Including every question in the FAQ is too many, and so, none of them have been included. Alas."
	]);
    }
}

var Support = {
    view: function() {
	var url = 'http://github.com/jkominek/mithrildemo';
	return  m('div', [
	    "See the github page for this, which probably something like",
	    m('a', {href:url}, url),
	    "."
	]);
    }
}

var About = {
    view: function() {
	return m('div', [
	    "This is a demo of making a single page app with Mithril. It was written by Jay Kominek, with style inspired by Hacker News."
	]);
    }
}

var Legal = {
    view: function() {
	return m('div', [
	    "This is licensed for you to reuse:",
	    m('div', 'Mithril says it is MIT licensed. Good.'),
	    m('div', 'The little cog icon said it was MIT licensed. Good.'),
	    m('div', 'The stuff Jay wrote is CC0 "licensed". Good.'),
	    "That about covers it?"
	])
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
    // we won't clean up the search results when leaving the
    // search screen. i always find i want to see them again.
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
var loginFailureMessage = false;
/* if the auth_required function catches a route request and
 * redirects it to the login screen, it'll store the requested
 * route here, and Login will send us there upon success.
 */
var desiredPathAwaitingAuth = false;

var Logout = {
    view: function() {
	loggedInAs = false;
	m.redraw();
	return "logged out"
    }
}

/* Receives the username and password */
function handleLoginInAttempt(username, password, onSuccess, onFailure) {
    // you could leave the Login view alone and replace the
    // guts here with something to make your login calls.
    if(true) {
	loggedInAs = username;
	onSuccess();
    } else {
	onFailure("foo");
    }
}

var Login = {
    onremove: function() {
	// clear the failure message when we leave the login view
	loginFailureMessage = false;
    },
    view: function() {
	function onSuccess() {
	    // if a destination was stored, go there, otherwise
	    // just go to the index URL
	    if(desiredPathAwaitingAuth) {
		m.route.set(desiredPathAwaitingAuth);
		desiredPathAwaitingAuth = false;
	    } else {
		m.route.set("/index");
	    }
	}
	function onFailure(errormsg) {
	    loginFailureMessage = errormsg;
	    m.redraw();
	}

	var username = m('input', {type: 'text', autofocus: true});
	var password = m('input', {type: 'password'});
	function username_handler() {
	    password.dom.focus();
	}
	function password_handler() {
	    handleLoginInAttempt(username.dom.value, password.dom.value,
				 onSuccess, onFailure);
	}
	username.attrs["onchange"] = username_handler;
	password.attrs["onchange"] = password_handler;

	x = m('table', { id: "passwordform" },
	      m('tr',
		m('td', 'username:'),
		m('td', username)),
	      m('tr',
		m('td', 'password:'),
		m('td', password)),
	      m('tr',
		m('td'),
		m('td',
		  m('button', {onclick: password_handler},
		    "Log In"))),
	      loginFailureMessage
	      ? m('tr',
		  m('td', {id: "errormsg"},
		    loginFailureMessage))
	      : ""
	     );
	return x;
    }
}

/* Renders a little bit in the menu bar about the logged in user */
var UserStatus = {
    view: function() {
	// display a login link if we're not logged in
	if(!loggedInAs) {
	    return m('a', {id:"login", href:"/login", oncreate:m.route.link},
		     "login")
	}
	// otherwise something useful, and a logout link
	return [
	    m('a', {id:"userinfo",
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
		// i hate those sites that get confused and think
		// that you're logging in just to go to the logout
		// page. ugh.
		if(!requestedPath.startsWith("/logout")) {
		    desiredPathAwaitingAuth = requestedPath;
		} else {
		    desiredPathAwaitingAuth = false;
		}
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

	// unimplemented
	// "/userinfo": auth_required(Userinfo),
	
	"/login": Login,
	"/logout": auth_required(Logout),
    });
    console.log("go!");
});
