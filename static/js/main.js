// Generated by CoffeeScript 1.9.2
(function() {
  var ap_list, ap_list_empty, ap_tpl, assert, conn_action, conn_box, conn_config, conn_mode, conn_mode_lock, conn_status, data_node;

  assert = function(condition, message) {
    if (!condition) {
      throw message || 'Assertion failed';
    }
  };

  assert(JSON && $ && SockJS);

  data_node = $('script[src="js/main.js"]');

  assert(data_node.get(0));

  conn_box = $('#sb-conn-box');

  conn_status = conn_box.find('#sb-conn-status');

  conn_action = conn_box.find('#sb-conn-action');

  conn_config = conn_box.find('#sb-conn-config');

  conn_mode = $('#sb-conn-mode');

  conn_mode_lock = false;

  ap_list = $('#sb-ap-list');

  ap_list_empty = ap_list.find('.sb-ap-list-empty');

  ap_tpl = ap_list.find('.sb-ap.sb-ap-tpl');

  assert(ap_list_empty && ap_tpl && conn_box);

  $(document).ready(function() {
    var sb_switch_auto, scan_ev_id, sock, sock_connect, sock_connect_timer, sock_evid, sock_evid_get, sock_evid_handlers, sock_onclose, sock_onmessage, sock_onopen, sock_send, sock_url;
    sock_url = data_node.data('events-url');
    console.log('SockJS url:', sock_url);
    assert(sock_url);
    sock_evid = 0;
    sock_evid_get = function() {
      return sock_evid += 1;
    };
    sock_evid_handlers = {};
    sock = sock_connect_timer = null;
    sock_send = function(q, data) {
      assert(q != null);
      if (data == null) {
        data = {};
      }
      data.q = q;
      data.id = sock_evid_get();
      console.log('sending:', data);
      sock.send(JSON.stringify(data));
      return data.id;
    };
    sock_connect = function() {
      sock = new SockJS(sock_url);
      sock.onopen = sock_onopen;
      sock.onclose = sock_onclose;
      return sock.onmessage = sock_onmessage;
    };
    sock_onopen = function() {
      console.log('connected to:', sock_url);
      if (sock_connect_timer) {
        clearInterval(sock_connect_timer);
        ap_list.find('.sb-ap').not(ap_tpl).remove();
        sock_send('sync');
        return sock_connect_timer = null;
      }
    };
    sock_onclose = function() {
      console.log('disconnected from:', sock_url);
      if (!sock_connect_timer) {
        return sock_connect_timer = window.setInterval((function() {
          return sock_connect();
        }), 2000);
      }
    };
    sock_onmessage = function(e) {
      var ap, ap_btn, ap_btn_default, ap_btn_reset_others, ap_btn_toggle, ap_others, ap_pass, ap_pass_box, ap_pass_ph, data;
      data = $.parseJSON(e.data);
      console.log('message:', data);
      if (data.q === 'new' || data.q === 'update') {
        if (data.q === 'new') {
          ap = ap_tpl.clone(true).detach();
          ap.attr('id', "sb-ap-uid-" + data.ap.uid);
          ap.find('.sb-ap-form-auto').bootstrapSwitch().on('switchChange', sb_switch_auto);
        } else {
          ap = ap_list.find("#sb-ap-uid-" + data.ap.uid);
        }
        ap.find('.ssid').text(data.ap.ssid);
        ap.find('button').attr('title', data.ap.title);
        ap.find('.sb-ap-bar-inner').css('width', data.ap.strength + "%");
        ap.find('.sb-ap-private').toggleClass('invisible', !data.ap["private"]);
        ap.find('.sb-ap-form-connect-open').toggleClass('hidden', data.ap["private"]);
        ap.find('.sb-ap-form-auto').bootstrapSwitch('state', data.ap.auto !== false);
        ap_pass_box = ap.find('.sb-ap-form-passphrase');
        ap_pass_box.toggleClass('hidden', !data.ap["private"]).removeClass('has-success has-error has-feedback');
        if (data.ap.pass_state) {
          ap_pass_box.addClass('has-feedback').addClass("has-" + data.ap.pass_state);
        }
        ap_pass = ap.find('.sb-ap-passphrase');
        ap_pass_ph = data.ap.pass_state ? ap_pass.data("ph-state-" + data.ap.pass_state) : null;
        if (!ap_pass_ph) {
          ap_pass_ph = ap_pass.data('ph-state-other');
        }
        ap_pass.attr('placeholder', ap_pass_ph);
        ap.find('.sb-ap-state span').addClass('hidden');
        if (data.ap.pass_state) {
          ap.find(".sb-ap-state .sb-ap-state-" + data.ap.pass_state).removeClass('hidden');
        }
        if (data.q === 'new') {
          ap.removeClass('sb-ap-tpl hidden');
          ap.appendTo(ap_tpl.parent());
          ap_list_empty.addClass('hidden');
          ap.find('.sb-ap-uid').val(data.ap.uid);
          return ap.find('.dropdown-menu').click(function(ev) {
            return ev.stopPropagation();
          });
        }
      } else if (data.q === 'remove') {
        ap_list.find("#sb-ap-uid-" + data.ap.uid).remove();
        if (ap_list.find('.sb-ap').not(ap_tpl).length === 0) {
          return ap_list_empty.removeClass('hidden');
        }
      } else if (data.q === 'status') {
        if (data.ap_uid != null) {
          ap = ap_list.find("#sb-ap-uid-" + data.ap_uid);
          ap_others = ap_list.find('.sb-ap').not(ap_tpl).not(ap);
          ap_btn = ap.find('.sb-ap-btn-main');
        } else {
          ap = ap_btn = null;
        }
        ap_btn_default = true;
        ap_btn_toggle = function(ap, highlight, connected, others) {
          var ap_btn_hide, ap_btn_show, ref;
          if (highlight == null) {
            highlight = false;
          }
          if (connected == null) {
            connected = false;
          }
          if (others == null) {
            others = false;
          }
          ref = highlight ? ['disconnect', 'connect'] : ['connect', 'disconnect'], ap_btn_show = ref[0], ap_btn_hide = ref[1];
          ap.find('.sb-ap-form-connect-btn[name="' + ap_btn_show + '"]').removeClass('hidden');
          ap.find('.sb-ap-form-connect-btn[name="' + ap_btn_hide + '"]').addClass('hidden');
          if (highlight) {
            ap_btn.removeClass('btn-danger').addClass(connected ? 'btn-success' : 'btn-info');
          }
          if (!others) {
            return ap_btn_default = false;
          }
        };
        ap_btn_reset_others = function() {
          return ap_btn_toggle(ap_others, false, false, true);
        };
        conn_status.text(data.status);
        conn_action.text(data.action);
        conn_box.removeClass('alert-info').removeClass('alert-success').addClass(data.code === 'done' ? 'alert-success' : 'alert-info');
        ap_list.find('.sb-ap-btn-main').removeClass('btn-success btn-info');
        if (data.code != null) {
          if (data.code.startsWith('live_')) {
            ap_btn_reset_others();
            ap_btn_toggle(ap, true);
          } else if (data.code.startsWith('fail_')) {
            ap_btn.addClass('btn-danger');
            ap_btn_reset_others();
          }
        }
        if (data.code === 'done') {
          conn_config.html(data.config);
          conn_config.removeClass('hidden');
          ap_btn_reset_others();
          ap_btn_toggle(ap, true, true);
        } else {
          conn_config.addClass('hidden');
        }
        if (ap_btn_default) {
          if (ap == null) {
            ap = ap_list.find('.sb-ap');
          }
          return ap_btn_toggle(ap);
        }
      } else if (data.q === 'online') {
        conn_mode_lock = true;
        conn_mode.bootstrapSwitch('state', data.value);
        return conn_mode_lock = false;
      } else if (data.q === 'result') {
        if (sock_evid_handlers[data.id] != null) {
          sock_evid_handlers[data.id](data);
          return delete sock_evid_handlers[data.id];
        }
      } else {
        return console.log('unrecognized ev:', data);
      }
    };
    sock_connect();
    ap_list.find('.dropdown-menu').click(function(ev) {
      return ev.stopPropagation();
    });
    ap_list.find('form').submit(function(ev) {
      var action, form, form_data;
      conn_mode.bootstrapSwitch('state', true);
      form = $(ev.target);
      form_data = form.serializeArray();
      action = $('.sb-ap-form-connect-btn:visible').attr('name');
      form_data.push({
        name: action,
        value: 't'
      });
      if (action === 'connect') {
        sock_send('connect', {
          form: form_data
        });
      } else if (action === 'disconnect') {
        sock_send('disconnect');
      } else {
        console.log('Unrecognized form action:', form_data);
      }
      return false;
    });
    sb_switch_auto = function(ev, data) {
      var ap_uid;
      ap_uid = $(data.el).parents('form').find('.sb-ap-uid').val();
      if (ap_uid !== 'none') {
        sock_send('auto', {
          ap_uid: ap_uid,
          value: data.value
        });
      }
      return false;
    };
    $('.sb-ap-form-auto').not(ap_tpl.find('.sb-ap-form-auto')).bootstrapSwitch().on('switchChange', sb_switch_auto);
    $('.sb-ap-form-auto-box .sb-label').on('click', function(ev) {
      return $(ev.target).parents('.sb-ap-form-auto-box').find('.sb-ap-form-auto').bootstrapSwitch('toggleState');
    });
    conn_mode.bootstrapSwitch().on('switchChange', function(ev, data) {
      if (!conn_mode_lock) {
        sock_send('online', {
          value: data.value
        });
      }
      return false;
    });
    scan_ev_id = null;
    return $('#sb-scan').on('click', function(ev) {
      if (scan_ev_id == null) {
        scan_ev_id = sock_send('scan');
        $(ev.target).addClass('disabled');
        sock_evid_handlers[scan_ev_id] = function() {
          scan_ev_id = null;
          return $(ev.target).removeClass('disabled');
        };
      }
      return false;
    });
  });

}).call(this);
