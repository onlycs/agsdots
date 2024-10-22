var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// /home/angad/code/agsdots/types/@girs/gtk-3.0/gtk-3.0.cjs
var require_gtk_3_0 = __commonJS((exports, module) => {
  imports.gi.versions.Gtk = "3.0";
  var Gtk2 = imports.gi.Gtk;
  module.exports = Gtk2;
});

// /home/angad/code/agsdots/types/@girs/pango-1.0/pango-1.0.cjs
var require_pango_1_0 = __commonJS((exports, module) => {
  imports.gi.versions.Pango = "1.0";
  var Pango = imports.gi.Pango;
  module.exports = Pango;
});

// src/prelude.ts
import { Binding } from "resource:///com/github/Aylur/ags/service.js";
function JoinHandlers(a, b) {
  if (b instanceof Binding)
    return b.transform((f) => JoinHandlers(a, f));
  else
    return (e, args) => {
      a?.(e, args);
      b?.(e, args);
    };
}
var AddHoverClass = (self) => self.class_name += " Hover";
var RemoveHoverClass = (self) => self.class_name = self.class_name.replaceAll("Hover", "");
var AddClickClass = (self) => self.class_name += " Click";
var RemoveClickClass = (self) => self.class_name = self.class_name.replaceAll("Click", "");

// src/components/interactable.ts
function Interactable(props) {
  const _hover = (self) => AddHoverClass(self.child);
  const _unhover = (self) => RemoveHoverClass(self.child);
  const _click = (self) => AddClickClass(self.child);
  const _unclick = (self) => RemoveClickClass(self.child);
  const _setup = (self) => self.on("leave-notify-event", _unhover);
  return Widget.EventBox({
    ...props,
    on_hover: JoinHandlers(_hover, props.on_hover),
    on_hover_lost: JoinHandlers(_unhover, props.on_hover_lost),
    on_primary_click: JoinHandlers(_click, props.on_primary_click),
    on_primary_click_release: JoinHandlers(_unclick, props.on_primary_click_release),
    setup: (self) => {
      _setup(self);
      props.setup?.(self);
    }
  });
}

// src/widgets/bar/activewindow.ts
function TitleTransformer(title) {
  const activeclass = Hyprland.active.client.class;
  if (activeclass in ClassTitleOverrides) {
    return ClassTitleOverrides[activeclass](title);
  }
  return title;
}
function ClassTransformer(classname) {
  if (classname in ClassOverrides) {
    return ClassOverrides[classname];
  }
  return classname;
}
var Hyprland = await Service.import("hyprland");
var ClassTitleOverrides = {
  kitty: (_) => "Terminal",
  "code-url-handler": (title) => title.replace("Visual Studio Code", "VSCode"),
  firefox: (title) => title.replace("Mozilla Firefox", "Firefox"),
  "": (_) => "Desktop"
};
var ClassOverrides = {
  "code-url-handler": "vscode",
  "": "hyprland"
};
var activewindow_default = Interactable({
  child: Widget.Box({
    children: [
      Widget.Label({
        label: Hyprland.active.client.bind("title").transform(TitleTransformer),
        class_name: "TextMain",
        max_width_chars: 10,
        truncate: "end"
      }),
      Widget.Label({
        label: Hyprland.active.client.bind("class").transform(ClassTransformer),
        class_name: "TextSub",
        max_width_chars: 10,
        truncate: "end"
      })
    ],
    vertical: true,
    class_name: "BarElement ActiveWindow"
  })
});

// src/widgets/bar/activeworkspace.ts
function UpdateIndicatorMask() {
  (async () => {
    const json = await Hyprland2.messageAsync("j/workspaces").catch(() => null);
    if (!json)
      return;
    const workspaces = JSON.parse(json);
    let mask = 0;
    for (const wksp of workspaces) {
      if (wksp.windows == 0)
        continue;
      const id = wksp.id - 1;
      mask |= 1 << id % 10;
    }
    IndicatorMask.setValue(mask);
  })().catch(console.error);
}
var Hyprland2 = await Service.import("hyprland");
var IndicatorMask = Variable(0);
var Indicator = () => {
  function MakeClassName(mask, i) {
    let classname = "WorkspaceIndicator";
    if (i == 9)
      classname += " Last";
    if (mask & 1 << i)
      classname += " Windows";
    return classname;
  }
  function Boxes() {
    const widgets = [];
    for (const i of Array(10).keys()) {
      widgets.push(Widget.Box({
        class_name: IndicatorMask.bind("value").transform((v) => MakeClassName(v, i))
      }));
    }
    return widgets;
  }
  return Widget.Box({
    children: Boxes(),
    setup: (self) => self.hook(Hyprland2, UpdateIndicatorMask, "notify::workspaces").hook(Hyprland2, UpdateIndicatorMask, "notify::clients")
  });
};
var ActiveWorkspace = (workspace) => {
  const dot = 6;
  const space = 6;
  const active = workspace.transform((id) => id - 1);
  const Before = (id) => {
    const spacing = id * dot + (id - 1) * space;
    switch (id) {
      case 0:
        return "background-color: transparent";
      default:
        return `min-width: ${spacing}px;`;
    }
  };
  const Current = (id) => {
    const EndMargin = {
      0: "margin-left: 0",
      9: "margin-right: 0"
    }[id] ?? "";
    return `min-width: 6px; ${EndMargin}`;
  };
  const After = (id) => {
    const spacing = (9 - id) * dot + Math.max(0, 8 - id) * space;
    switch (id) {
      case 9:
        return "background-color: transparent";
      default:
        return `min-width: ${spacing}px;`;
    }
  };
  return Widget.Box({
    children: [
      Widget.Box({
        class_name: "SliderSegment",
        css: active.transform(Before)
      }),
      Widget.Box({
        class_name: "SliderSegment Current",
        css: active.transform(Current)
      }),
      Widget.Box({
        class_name: "SliderSegment",
        css: active.transform(After)
      })
    ],
    class_name: "SliderBox"
  });
};
var activeworkspace_default = Interactable({
  child: Widget.Box({
    vertical: true,
    children: [ActiveWorkspace(Hyprland2.active.workspace.bind("id")), Indicator()],
    class_name: "BarElement WorkspaceBox",
    homogeneous: true
  })
});

// src/services/menuvis.ts
var OpenMenu = Variable("");
var MenuVis = {
  bind: (window) => OpenMenu.bind().transform((n) => n == window),
  bind_clickoff: () => OpenMenu.bind().transform((n) => n != ""),
  closeall: () => {
    OpenMenu.setValue("");
  },
  set: (window) => {
    OpenMenu.setValue(window ?? "");
  }
};
var menuvis_default = MenuVis;

// src/variables.ts
var Moment = {
  Time: Variable("", {
    poll: [1000, function() {
      return Utils.exec('date +"%l:%M %p"').trim();
    }]
  }),
  Date: Variable("", {
    poll: [1000, function() {
      return Utils.exec('date +"%A, %b %d"').trim();
    }]
  }),
  FullDate: Variable("", {
    poll: [1000, function() {
      return Utils.exec('date +"%B %d, %Y"').trim();
    }]
  }),
  DateNumbers: Variable("", {
    poll: [1000, function() {
      return Utils.exec('date +"%m/%d/%Y"').trim();
    }]
  }),
  Month: Variable("", {
    poll: [1000, function() {
      return Utils.exec('date +"%B"').trim();
    }]
  }),
  DateLabel: Variable("", {
    poll: [1000, function() {
      return Utils.exec('date +"%B %0d, %Y"').trim();
    }]
  }),
  Dotw: Variable("", {
    poll: [1000, function() {
      return Utils.exec('date +"%A"').trim();
    }]
  })
};

// src/widgets/bar/datetime.ts
var datetime_default = Interactable({
  child: Widget.Box({
    children: [
      Widget.Label({
        label: Moment.Date.bind(),
        class_name: "TextMain TextLarge DateTime"
      }),
      Widget.Label({
        label: " \u2014 ",
        class_name: "TextMain TextLarge DateTime"
      }),
      Widget.Label({
        label: Moment.Time.bind(),
        class_name: "TextMain TextLarge DateTime"
      })
    ],
    class_name: "BarElement DateTimeBox"
  }),
  on_primary_click_release: () => {
    menuvis_default.set("barmenu");
  }
});

// src/widgets/bar/index.ts
var bar_default = Widget.Window({
  monitor: 0,
  name: "bar",
  anchor: ["top", "left", "right"],
  exclusivity: "exclusive",
  class_name: "Bar",
  child: Widget.CenterBox({
    start_widget: Widget.Box({
      children: [activewindow_default, activeworkspace_default],
      spacing: 8
    }),
    center_widget: Widget.Box({
      children: [datetime_default],
      spacing: 8
    }),
    end_widget: Widget.Box({}),
    class_name: "Bar"
  }),
  height_request: 28
});

// src/services/appicon.ts
import Gtk from "gi://Gtk";
var IconTheme = Gtk.IconTheme.get_default();
var Icons = IconTheme.list_icons("Applications");
function GetIcon(name) {
  if (Icons.includes(name))
    return name;
  else
    return "preferences-system-notifications-symbolic";
}

// src/services/image.ts
import GdkPixbuf from "gi://GdkPixbuf";
import Gio from "gi://Gio";
function ImageFromUrl(url) {
  const stream = Gio.File.new_for_uri(url).read(null);
  return GdkPixbuf.Pixbuf.new_from_stream(stream, null);
}

// src/components/button.ts
function Button(props) {
  const _hover = (self) => AddHoverClass(self);
  const _unhover = (self) => RemoveHoverClass(self);
  const _click = (self) => AddClickClass(self);
  const _unclick = (self) => RemoveClickClass(self);
  const _setup = (self) => self.on("leave-notify-event", _unhover);
  return Widget.Button({
    ...props,
    on_hover: JoinHandlers(_hover, props.on_hover),
    on_hover_lost: JoinHandlers(_unhover, props.on_hover_lost),
    on_primary_click: JoinHandlers(_click, props.on_primary_click),
    on_primary_click_release: JoinHandlers(_unclick, props.on_primary_click_release),
    setup: (self) => {
      _setup(self);
      props.setup?.(self);
    }
  });
}

// src/widgets/barmenu/notification.ts
import GLib from "gi://GLib";

// src/services/dnd.ts
var DND = Variable(false);
var DNDManager = {
  bind: () => DND.bind(),
  get: () => DND.value,
  set: (state) => {
    DND.setValue(state);
  },
  switch: ({ active }) => {
    DNDManager.set(active);
  }
};
var dnd_default = DNDManager;

// src/widgets/barmenu/notification.ts
var NotifyService = await Service.import("notifications");
var has_notifications = () => NotifyService.notifications.length > 0;
var RelTime = (utime) => {
  const time = GLib.DateTime.new_from_unix_local(utime);
  const now = GLib.DateTime.new_now_local();
  const diffus = now.difference(time);
  const diff = diffus / 1e6;
  const DiffTimes = [
    [60, (_) => "Just now"],
    [3600, (d) => `${Math.floor(d / 60)}m ago`],
    [86400, (d) => `${Math.floor(d / 3600)}h ago`],
    [-1, (d) => `${Math.floor(d / 86400)}d ago`]
  ];
  for (const [limit, fmt] of DiffTimes)
    if (diff < limit || limit == -1)
      return fmt(diff);
};
var Header = (n) => Widget.Box({
  class_name: "Header",
  children: [
    Widget.Icon({
      icon: GetIcon(n.app_icon),
      class_name: "AppIcon",
      css: "-gtk-icon-style: symbolic",
      size: 16
    }),
    Widget.Label({
      label: n.app_name,
      class_name: "AppName"
    }),
    Widget.Label({
      label: RelTime(n.time),
      class_name: "Timestamp"
    })
  ]
});
var Actions = (n) => Widget.Box({
  class_name: "Actions",
  children: n.actions.map((a) => Button({
    label: a.label,
    class_name: "Action",
    hexpand: false,
    on_primary_click_release: () => {
      NotifyService.InvokeAction(n.id, a.id);
    }
  }))
});
var Close = (n) => Widget.Button({
  image: Widget.Icon({
    icon: "window-close-symbolic",
    size: 16
  }),
  class_name: "Close",
  on_primary_click_release: () => {
    NotifyService.CloseNotification(n.id);
  }
});
var Content = (n) => {
  const textchildren = [
    Widget.Label({
      label: n.summary,
      class_name: "Title",
      truncate: "end",
      hpack: "start"
    })
  ];
  if (n.body.trim() != "")
    textchildren.push(Widget.Label({
      label: n.body.trim(),
      class_name: "Body",
      wrap: true,
      hpack: "start",
      justification: "fill"
    }));
  const children = [
    Widget.Box({
      class_name: "TextBox",
      vertical: true,
      spacing: 4,
      children: textchildren
    })
  ];
  if (n.image)
    children.unshift(Widget.Icon({
      class_name: "Image",
      icon: ImageFromUrl(n.image),
      size: 64,
      vpack: "start"
    }));
  return Widget.Box({
    class_name: "Content",
    children
  });
};
var NotificationWidget = (n) => Widget.Box({
  name: `Notification-${n.id}`,
  class_name: "Notification",
  vertical: true,
  spacing: 8,
  hexpand: false,
  children: [
    Widget.CenterBox({
      start_widget: Widget.Box({
        children: [Header(n)],
        halign: 1
      }),
      end_widget: Widget.Box({
        halign: 2,
        children: [Close(n)]
      })
    }),
    Content(n),
    ...n.actions.length > 0 ? [Actions(n)] : []
  ]
});
var NotificationFallback = () => Widget.Box({
  halign: 3,
  valign: 3,
  vexpand: true,
  vertical: true,
  spacing: 24,
  class_name: "Fallback",
  children: [
    Widget.Icon({
      icon: "preferences-system-notifications-symbolic",
      size: 96,
      class_name: "Icon"
    }),
    Widget.Label({
      label: "No Notifications",
      class_name: "Label"
    })
  ]
});
var NotificationList = (notifs) => Widget.Scrollable({
  hscroll: "never",
  vexpand: true,
  class_name: "Scrollbox",
  vscrollbar_policy: 1,
  child: Widget.Box({
    class_name: "Notifications",
    vertical: true,
    vexpand: true,
    children: notifs.map(NotificationWidget),
    spacing: 16
  })
});
var Footer = () => Widget.CenterBox({
  class_name: "Footer",
  halign: 0,
  start_widget: Widget.Box({
    halign: 1,
    children: [
      Widget.Label({
        label: "Do Not Disturb",
        class_name: "DNDLabel"
      }),
      Widget.Switch({
        class_name: "Switch",
        on_activate: dnd_default.switch
      })
    ]
  }),
  end_widget: Widget.Box({
    halign: 2,
    children: [
      Button({
        class_name: "Button",
        label: "Clear",
        on_primary_click_release: () => {
          NotifyService.Clear();
        },
        setup: (self) => self.hook(NotifyService, (self2) => self2.visible = has_notifications(), "notify")
      })
    ]
  })
});
var notification_default = Widget.Box({
  class_name: "NotificationsBox",
  vertical: true,
  children: [
    Widget.Box({
      children: [],
      halign: 3,
      setup: (self) => {
        self.hook(NotifyService, (self2) => {
          if (NotifyService.notifications.length == 0) {
            self2.children = [NotificationFallback()];
          } else {
            self2.children = [NotificationList(NotifyService.notifications)];
          }
        }, "notify");
      }
    }),
    Footer()
  ]
});

// src/widgets/barmenu/datemenu/date.ts
var date_default = () => {
  const DayLabel = Widget.Label({
    label: Moment.Dotw.bind(),
    class_name: "Dotw",
    xalign: 0
  });
  const DateLabel = Widget.Label({
    label: Moment.FullDate.bind(),
    class_name: "FullDate",
    xalign: 0
  });
  return Widget.Box({
    class_name: "Date",
    vertical: true,
    children: [
      DayLabel,
      DateLabel
    ]
  });
};

// src/services/calendar.ts
function date_to_id(date) {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  return [day, month, year].join("-");
}
function dmy_to_id(day, month, year) {
  return date_to_id(new Date(year, month, day));
}
function today_id() {
  return date_to_id(new Date);
}
function id_to_date(id) {
  const [day, month, year] = id.split("-").map(Number);
  return new Date(year, month, day);
}
function first_dotw(month, year) {
  return new Date(year, month, 1).getDay();
}
function days_in(month, year) {
  return new Date(year, month + 1, 0).getDate();
}
function last_end(month, year, selected) {
  const begin_dotw = first_dotw(month, year);
  const prepend_days = begin_dotw == 0 ? 7 : begin_dotw;
  const prepend_last = days_in(month - 1, year);
  const prepend_begin = prepend_last - prepend_days + 1;
  const days = [];
  for (let i = 0;i < prepend_days; i++) {
    const id = dmy_to_id(prepend_begin + i, month - 1, year);
    days.push({
      id,
      date: prepend_begin + i,
      today: false,
      in_month: false,
      selected: selected == id
    });
  }
  return days;
}
function all_days(month, year, selected) {
  const days = last_end(month, year, selected);
  const num_days = days_in(month, year);
  for (let i = 1;i <= num_days; i++) {
    const id = dmy_to_id(i, month, year);
    const today = new Date;
    days.push({
      id,
      date: i,
      today: i == today.getDate() && month == today.getMonth() && year == today.getFullYear(),
      in_month: true,
      selected: selected == id
    });
  }
  const next_days = 6 * 7 - days.length;
  for (let i = 1;i <= next_days; i++) {
    const id = dmy_to_id(i, month + 1, year);
    days.push({
      id,
      date: i,
      today: false,
      in_month: false,
      selected: selected == id
    });
  }
  return days;
}
function first_woty(month, year) {
  const first = new Date(year, month, 1);
  const first_woty2 = Utils.exec(`date -d "${first.toISOString()}" +%V`);
  return parseInt(first_woty2);
}
function generate_month(month, year, selected) {
  const days = all_days(month, year, selected);
  const weeks = [];
  const woty = first_woty(month, year);
  for (let i = 0;i < days.length; i += 7) {
    weeks.push({
      days: days.slice(i, i + 7),
      woty: woty + i / 7
    });
  }
  return weeks;
}
function ago(other) {
  return new Date().getTime() - (other?.getTime() ?? 0);
}
function id_to_key(id) {
  const [_, month, year] = id.split("-").map(Number);
  return { month, year };
}
function date_to_key(date) {
  return { month: date.getMonth(), year: date.getFullYear() };
}
function filter_date(d) {
  return (ev) => {
    if (!ev.end || !ev.start)
      return false;
    if (ev.end.date) {
      const evday = new Date(ev.end.date);
      return evday.getDate() == d.getDate() && evday.getMonth() == d.getMonth();
    }
    const start = new Date(ev.start.dateTime);
    const end = new Date(ev.end.dateTime);
    if (end.getTime() > d.getTime() && start.getTime() < d.getTime())
      return true;
    return start.getDate() == d.getDate() && start.getMonth() == d.getMonth();
  };
}
function filter_id(s) {
  return filter_date(id_to_date(s));
}
var Months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

class GoogleCalendarManager {
  #cache = new Map;
  register(response) {
    this.#cache.set(JSON.stringify(response.key), response);
  }
  get(key) {
    return this.#cache.get(JSON.stringify(key));
  }
  has(key) {
    return this.#cache.has(JSON.stringify(key));
  }
  remove(key) {
    this.#cache.delete(JSON.stringify(key));
  }
}

class CalService extends Service {
  static {
    Service.register(this, {}, {
      data: ["gobject", "r"]
    });
  }
  #month = 0;
  #year = 0;
  #selected = today_id();
  #google = new GoogleCalendarManager;
  constructor() {
    super();
    this.reset();
    Utils.interval(1000 * 60 * 60, () => {
      this.#update_gcal();
    });
  }
  get data() {
    const header = () => {
      if (this.#year == new Date().getFullYear())
        return Months[this.#month];
      else
        return `${Months[this.#month]} ${this.#year}`;
    };
    return {
      selected: this.#selected,
      weeks: generate_month(this.#month, this.#year, this.#selected),
      header: header(),
      gcal: this.#google.get({
        month: this.#month,
        year: this.#year
      })
    };
  }
  get curmonth() {
    return this.#month;
  }
  get curyear() {
    return this.#year;
  }
  #notify() {
    this.notify("data");
  }
  #fetch_gcal() {
    const date = id_to_date(this.#selected);
    this.#google.remove(date_to_key(date));
    this.#notify();
    const command = `nu -c 'cd ${App.configDir}; echo "${id_to_date(this.#selected).toISOString()}" | bun run --silent gcal'`;
    Utils.execAsync(command).then(JSON.parse).then((output) => {
      this.#google.register({
        ...output,
        generated: new Date(output.generated)
      });
      this.#notify();
    }).catch(console.error);
  }
  #update_gcal() {
    const key = id_to_key(this.#selected);
    if (this.#google.has(key) && ago(this.#google.get(key).generated) <= 1000 * 60 * 60) {
      this.#notify();
      return;
    }
    this.#fetch_gcal();
  }
  #on_month_change() {
    if (new Date().getMonth() == this.#month)
      this.#selected = date_to_id(new Date);
    else
      this.#selected = `1-${this.#month}-${this.#year}`;
    this.#on_day_change();
  }
  #on_day_change() {
    this.#update_gcal();
    this.#notify();
  }
  previous() {
    if (this.#month == 0)
      this.#month = 11, this.#year--;
    else
      this.#month--;
    this.#on_month_change();
  }
  next() {
    if (this.#month == 11)
      this.#month = 0, this.#year++;
    else
      this.#month++;
    this.#on_month_change();
  }
  reset() {
    this.#month = new Date().getMonth();
    this.#year = new Date().getFullYear();
    this.#on_month_change();
  }
  select(day) {
    if (day == today_id() && this.#selected == today_id())
      return;
    else if (day == this.#selected)
      this.#on_month_change();
    else
      this.#selected = day;
    this.#on_day_change();
  }
  force_refresh() {
    this.#fetch_gcal();
  }
  bindkey(key) {
    return this.bind("data").transform((data) => data[key]);
  }
  bindkeys(...keys) {
    return this.bind("data").transform((data) => Object.fromEntries(keys.map((key) => [key, data[key]])));
  }
}
var CalendarService = new CalService;

// src/widgets/barmenu/datemenu/calendar.ts
var Header2 = () => Widget.CenterBox({
  class_name: "Header",
  start_widget: Widget.Box({
    children: [
      Button({
        class_name: "Button Left",
        image: Widget.Icon({
          icon: "pan-start-symbolic",
          size: 16
        }),
        on_primary_click_release: () => {
          CalendarService.previous();
        }
      })
    ]
  }),
  center_widget: Button({
    label: CalendarService.bindkey("header"),
    class_name: "LabelButton",
    on_primary_click_release: () => {
      CalendarService.reset();
    }
  }),
  end_widget: Widget.Box({
    halign: 2,
    children: [
      Button({
        class_name: "Button Right",
        image: Widget.Icon({
          icon: "pan-end-symbolic",
          size: 16
        }),
        on_primary_click_release: () => {
          CalendarService.next();
        }
      })
    ]
  })
});
var WeekLabels = () => Widget.Box({
  class_name: "WeekLabels",
  spacing: 17,
  halign: 3,
  children: ["S", "M", "T", "W", "T", "F", "S"].map((label) => Widget.Label({
    label,
    class_name: "WeekLabel"
  }))
});
var ZeroPadded = (day) => day.toString().padStart(2, "0");
var Week = (week, gcal) => Widget.Box({
  class_name: "Week",
  halign: 3,
  children: week.days.map((day) => Interactable({
    halign: 3,
    on_primary_click_release: () => {
      CalendarService.select(day.id);
    },
    child: Widget.Box({
      vertical: true,
      class_name: `Day ${day.today ? "Today" : ""} ${day.in_month ? "" : "Gray"} ${day.selected ? "Selected" : ""}`,
      halign: 3,
      children: [
        Widget.Label({
          label: ZeroPadded(day.date),
          class_name: "Label"
        }),
        Widget.Label({
          label: "\u2022".repeat(Math.min(Object.values(gcal?.events ?? {}).flatMap((n) => n.items ?? []).filter(filter_id(day.id)).length, 3)),
          class_name: "Bullet"
        })
      ]
    })
  }))
});
var Calendar = () => Widget.Box({
  vertical: true,
  class_name: "Weeks",
  children: CalendarService.bindkeys("weeks", "gcal").transform((data) => [WeekLabels(), ...data.weeks.map((week) => Week(week, data.gcal))])
});
var calendar_default = () => Widget.Box({
  class_name: "Calendar",
  hexpand: true,
  vertical: true,
  children: [
    Header2(),
    Calendar()
  ]
});

// src/widgets/barmenu/datemenu/events.ts
var import_gtk_3_0 = __toESM(require_gtk_3_0(), 1);
var import_pango_1_0 = __toESM(require_pango_1_0(), 1);
var CalculateDayText = (id) => {
  const today = new Date;
  const date = id_to_date(id);
  today.setHours(0, 0, 0, 0);
  if (today.toDateString() == date.toDateString()) {
    return "Today";
  } else if (today.setDate(today.getDate() - 1) == date.getTime()) {
    return "Yesterday";
  } else if (today.setDate(today.getDate() + 2) == date.getTime()) {
    return "Tomorrow";
  }
  if (today.getFullYear() != date.getFullYear()) {
    return `${Months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
  return `${Months[date.getMonth()]} ${date.getDate()}`;
};
var DayText = () => Widget.Label({
  label: CalendarService.bindkey("selected").transform(CalculateDayText),
  class_name: "DayText",
  xalign: 0
});
var Events = (cal) => {
  const calendars = cal.events;
  const events = [];
  const today = id_to_date(CalendarService.data.selected);
  const datefilter = filter_date(today);
  for (const color in calendars) {
    const evdata = calendars[color].items;
    if (evdata.length == 0)
      continue;
    const colored = evdata.map((ev) => ({ ...ev, color }));
    events.push(...colored);
  }
  const widgets = events.filter(datefilter).sort((a, b) => {
    const starta = a.start?.dateTime;
    const startb = b.start?.dateTime;
    if (!starta)
      return -1;
    if (!startb)
      return 1;
    return Date.parse(starta) - Date.parse(startb);
  }).map((ev) => {
    const get_fulltext = () => {
      const startstr = ev.start?.dateTime;
      const endstr = ev.end?.dateTime;
      if (!startstr || !endstr)
        return "All Day";
      const start = new Date(Date.parse(startstr));
      const end = new Date(Date.parse(endstr));
      const startday = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endday = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      const timeof = (date) => {
        const hours = date.getHours();
        const aphours = (hours + 11) % 12 + 1;
        const ap = hours >= 12 ? "pm" : "am";
        const minutes = date.getMinutes().toString().padStart(2, "0");
        if (minutes == "00")
          return `${aphours}${ap}`;
        else
          return `${aphours}:${minutes}${ap}`;
      };
      const num_days = (endday.getTime() - startday.getTime()) / (24 * 60 * 60 * 1000) + 1;
      const cur_day = (today.getTime() - startday.getTime()) / (24 * 60 * 60 * 1000) + 1;
      const textstart = timeof(start);
      const textend = timeof(end);
      let fulltext2 = `${textstart} - ${textend}`;
      if (startday.getTime() == endday.getTime()) {
        if (start.getHours() >= 12 == end.getHours() >= 12) {
          const stripped = textstart.substring(0, textstart.length - 2);
          fulltext2 = `${stripped} - ${textend}`;
        }
      } else if (startday.getTime() != today.getTime() && endday.getTime() != today.getTime()) {
        fulltext2 = "All Day";
        ev.summary += ` (Day ${cur_day}/${num_days})`;
      } else if (startday.getTime() == today.getTime()) {
        fulltext2 = textstart;
        ev.summary += ` (Day ${cur_day}/${num_days})`;
      } else {
        fulltext2 = `Until ${textend}`;
        ev.summary += ` (Day ${cur_day}/${num_days})`;
      }
      return fulltext2;
    };
    const fulltext = get_fulltext();
    return Widget.Box({
      class_name: "Event",
      vertical: false,
      children: [
        Widget.Box({
          css: `background-color: ${ev.color}`,
          class_name: "VPill"
        }),
        Widget.Box({
          vertical: true,
          children: [
            Widget.Label({
              label: fulltext.trim(),
              class_name: "Time",
              halign: import_gtk_3_0.Align.START
            }),
            Widget.Label({
              label: ev.summary,
              class_name: "Summary",
              halign: import_gtk_3_0.Align.START,
              ellipsize: import_pango_1_0.EllipsizeMode.END
            })
          ]
        })
      ]
    });
  });
  if (parseInt(CalendarService.data.selected.split("-")[1]) != CalendarService.curmonth)
    return [
      Widget.Label({
        label: "Will not fetch events outside current month",
        class_name: "NoEvents",
        wrap: true,
        justify: import_gtk_3_0.Justification.CENTER
      })
    ];
  else if (widgets.length == 0)
    return [Widget.Label({ label: "No Events", class_name: "NoEvents" })];
  else
    return widgets;
};
var events_default = () => Interactable({
  child: Widget.Box({
    class_name: "Events",
    vertical: true,
    children: CalendarService.bindkey("gcal").transform((cal) => [
      DayText(),
      ...cal ? Events(cal) : [Widget.Spinner()]
    ])
  }),
  on_primary_click_release: () => {
    menuvis_default.closeall();
    Utils.execAsync(["gnome-calendar", "--date", id_to_date(CalendarService.data.selected).toLocaleDateString()]).catch(console.error);
  }
});

// src/services/weather.ts
class Weather extends Service {
  static {
    Service.register(this, {}, {
      weather: ["gobject", "r"]
    });
  }
  #weather_val = undefined;
  constructor() {
    super();
    Utils.interval(1000 * 60 * 60, () => {
      this.#update();
    });
  }
  get weather() {
    return this.#weather_val;
  }
  #update() {
    const command = `nu -c 'cd ${App.configDir}; bun run --silent weather'`;
    Utils.execAsync(command).then(JSON.parse).then((output) => {
      this.#weather_val = output;
      this.notify("weather");
    }).catch(console.error);
  }
}
var WeatherService = new Weather;

// src/widgets/barmenu/datemenu/weather.ts
var IconMap = {
  "clear-day": "sun-outline",
  "clear-night": "moon-outline",
  rain: "scattered-rain-outline",
  snow: "snow-outline",
  sleet: "snow-outline",
  wind: "windy",
  cloudy: "clouds-outline",
  "partly-cloudy-day": "few-clouds-outline",
  "partly-cloudy-night": "moon-clouds-outline",
  thunderstorm: "storm-outline",
  hail: "storm-outline"
};
var Weather2 = (w) => {
  if (!w)
    return Widget.Label({
      label: "...",
      class_name: "Joe"
    });
  return Widget.Icon({
    icon: IconMap[w.icon] || "sun-outline",
    class_name: "Weather"
  });
};
var weather_default = () => Interactable({
  child: Widget.Box({
    class_name: "WeatherBox",
    vertical: true,
    children: WeatherService.bind("weather").transform((w) => [Weather2(w)])
  })
});

// src/widgets/barmenu/datemenu/index.ts
var datemenu_default = Widget.Box({
  class_name: "DateMenu",
  vertical: true,
  children: [
    date_default(),
    calendar_default(),
    events_default(),
    weather_default()
  ]
});

// src/widgets/barmenu/index.ts
var barmenu_default = Widget.Window({
  visible: menuvis_default.bind("barmenu"),
  name: "barmenu",
  anchor: ["top"],
  layer: "overlay",
  css: "background-color: transparent",
  child: Widget.Box({
    class_name: "BarMenuBox",
    children: [
      notification_default,
      Widget.Separator({ orientation: 1 }),
      datemenu_default
    ],
    spacing: 5
  })
});

// src/widgets/clickoff/index.ts
var clickoff_default = Widget.Window({
  name: "clickoff",
  visible: menuvis_default.bind_clickoff(),
  layer: "top",
  anchor: ["top", "left", "right", "bottom"],
  exclusivity: "ignore",
  keymode: "on-demand",
  class_name: "ClickOff",
  setup: (self) => self.keybind("Escape", menuvis_default.closeall),
  child: Widget.EventBox({
    on_primary_click: menuvis_default.closeall,
    on_secondary_click: menuvis_default.closeall,
    on_middle_click: menuvis_default.closeall
  })
});

// src/main.ts
App.addIcons(`${App.configDir}/res`);
Utils.monitorFile("/tmp/ags/index.css", () => {
  App.resetCss();
  App.applyCss("/tmp/ags/index.css");
});
Utils.execAsync([
  "nodemon",
  "-w",
  App.configDir,
  "--exec",
  ...[
    "sass",
    `${App.configDir}/styles/index.scss`,
    "/tmp/ags/index.css"
  ],
  "--ext",
  "scss"
]).catch(console.error);
App.config({
  windows: [bar_default, barmenu_default, clickoff_default]
});

//# debugId=7A7AEC8D9D4C00F964756E2164756E21
