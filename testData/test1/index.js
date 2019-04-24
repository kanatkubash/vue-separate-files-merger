import template from "./template.html";
import "./style.scss";
import Vue from "vue";

Vue.component("calendar", {
  template: template,
  props: {
    sdate: {
      type: String,
      default: ""
    },
    edate: {
      type: String,
      default: ""
    },
    showPresets: {
      type: Boolean,
      default: true
    },
    showPresetsSelect: {
      type: Boolean,
      default: false
    },
    showTimePicker: {
      type: Boolean,
      default: false
    },
    calendars: {
      type: Number,
      default: 1
    },
    mode: {
      type: String,
      default: "range" // single/multiple/range
    },
    setPeriodToToday: {
      type: Boolean,
      default: false
    },
    stime: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      sd: "",
      ed: "",
      times: new Array(24)
        .fill()
        .map((_, index) =>
          index < 10
            ? [`0${index}:00`, `0${index}:30`]
            : [`${index}:00`, `${index}:30`]
        ),
      calendarPresets: [
        { name: "За все время", id: "all_time", checked: false },
        { name: "Сегодня", id: "today", checked: false },
        { name: "Вчера", id: "yesterday", checked: false },
        { name: "Эта неделя", id: "week", checked: false },
        { name: "Прошлая неделя", id: "last_week", checked: false },
        { name: "Этот месяц", id: "month", checked: false },
        { name: "Прошлый месяц", id: "last_month", checked: false },
        { name: "Этот квартал", id: "kv", checked: false },
        { name: "Этот год", id: "year", checked: false }
      ],
      startDate: "2000-01-01"
    };
  },

  methods: {
    preset(key) {
      let sd = new Date();
      let ed = new Date();

      switch (key) {
        case "yesterday": {
          sd.setDate(sd.getDate() - 1);
          ed = new Date(sd);

          break;
        }
        case "week": {
          let d = sd.getDay();

          if (d === 0) {
            sd.setDate(sd.getDate() - 6);
            ed = new Date();
          } else {
            sd.setDate(sd.getDate() - (d - 1));
            ed = new Date(sd);
            ed.setDate(ed.getDate() + 6);
          }

          break;
        }
        case "last_week": {
          let d = sd.getDay();

          if (d === 0) {
            sd.setDate(sd.getDate() - 13);
            ed = new Date(sd);
            ed.setDate(sd.getDate() + 6);
          } else {
            sd.setDate(sd.getDate() - (6 + d));
            ed = new Date(sd);
            ed.setDate(sd.getDate() + 6);
          }

          break;
        }
        case "month": {
          sd.setMonth(sd.getMonth(), 1);
          ed = new Date(sd);
          ed.setMonth(sd.getMonth() + 1, 0);

          break;
        }
        case "last_month": {
          sd.setMonth(sd.getMonth() - 1, 1);
          ed = new Date(sd);
          ed.setMonth(sd.getMonth() + 1, 0);

          break;
        }
        case "kv": {
          sd.setMonth(Math.ceil((sd.getMonth() + 1) / 3) * 3 - 3, 1);
          ed.setMonth(sd.getMonth() + 3, 0);

          break;
        }
        case "year": {
          sd = new Date(sd.getFullYear(), 0, 1);
          ed = new Date(sd.getFullYear() + 1, 0, 0);

          break;
        }
        case "all_time": {
          break;
        }
      }
      sd.setHours(0, 0, 0, 0);
      ed.setHours(0, 0, 0, 0);

      if (key === "all_time") {
        sd = "";
        ed = "";
      }

      this.sd = sd;
      this.ed = ed;
      let ssd, sed;
      pickmeup(".ini_calendar").set_date([this.sd, this.ed]);
      pickmeup(".ini_calendar").update();

      let d = pickmeup(".ini_calendar").get_date(true);
      ssd = d[0]
        .split("-")
        .reverse()
        .join("-");
      sed = d[1]
        .split("-")
        .reverse()
        .join("-");

      if (key === "all_time") {
        ssd = "";
        sed = "";
      }

      this.$emit("changed", { sd: ssd, ed: sed });
    },
    presetFromProps() {
      if (!this.sdate && !this.edate) {
        this.calendarPresetChanged("all_time");
        return;
      }

      const newDate = new Date();
      const sd = this.formatDateYMD(new Date(this.sdate));
      const ed = this.formatDateYMD(new Date(this.edate));
      const today = this.formatDateYMD(new Date());
      const yesterday = this.formatDateYMD(
        new Date(new Date().setDate(newDate.getDate() - 1))
      );

      const currentWeekDay = newDate.getDay();
      const currentWeek = { sd: "", ed: "" };
      const lastWeek = { sd: "", ed: "" };
      const currentMonth = { sd: "", ed: "" };
      const lastMonth = { sd: "", ed: "" };
      const quarter = { sd: "", ed: "" };
      const year = { sd: "", ed: "" };

      if (currentWeekDay === 0) {
        currentWeek.sd = this.formatDateYMD(
          new Date(new Date().setDate(newDate.getDate() - 6))
        );
        currentWeek.ed = today;
      } else {
        currentWeek.sd = this.formatDateYMD(
          new Date(new Date().setDate(newDate.getDate() - (currentWeekDay - 1)))
        );
        currentWeek.ed = this.formatDateYMD(
          new Date(
            new Date(currentWeek.sd).setDate(
              new Date(currentWeek.sd).getDate() + 6
            )
          )
        );
      }

      const currentWeekStartDate = new Date(currentWeek.sd);
      const currentWeekEndDate = new Date(currentWeek.ed);
      lastWeek.sd = this.formatDateYMD(
        new Date(
          currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7)
        )
      );
      lastWeek.ed = this.formatDateYMD(
        new Date(currentWeekEndDate.setDate(currentWeekEndDate.getDate() - 7))
      );

      currentMonth.sd = this.formatDateYMD(
        new Date(new Date().setMonth(newDate.getMonth(), 1))
      );
      currentMonth.ed = new Date(currentMonth.sd);
      currentMonth.ed = this.formatDateYMD(
        new Date(currentMonth.ed.setMonth(currentMonth.ed.getMonth() + 1, 0))
      );

      lastMonth.sd = this.formatDateYMD(
        new Date(new Date().setMonth(newDate.getMonth() - 1, 1))
      );
      lastMonth.ed = new Date(lastMonth.sd);
      lastMonth.ed = this.formatDateYMD(
        new Date(lastMonth.ed.setMonth(lastMonth.ed.getMonth() + 1, 0))
      );

      quarter.sd = this.formatDateYMD(
        new Date(
          new Date().setMonth(
            Math.ceil((newDate.getMonth() + 1) / 3) * 3 - 3,
            1
          )
        )
      );
      quarter.ed = this.formatDateYMD(
        new Date(
          new Date(quarter.sd).setMonth(new Date(quarter.sd).getMonth() + 3, 0)
        )
      );

      year.sd = this.formatDateYMD(new Date(newDate.getFullYear(), 0, 1));
      year.ed = this.formatDateYMD(
        new Date(new Date(year.sd).getFullYear() + 1, 0, 0)
      );

      if (sd === ed && sd === today) {
        this.calendarPresetChanged("today");
      } else if (sd === ed && sd === yesterday) {
        this.calendarPresetChanged("yesterday");
      } else if (sd === currentWeek.sd && ed === currentWeek.ed) {
        this.calendarPresetChanged("week");
      } else if (sd === lastWeek.sd && ed === lastWeek.ed) {
        this.calendarPresetChanged("last_week");
      } else if (sd === currentMonth.sd && ed === currentMonth.ed) {
        this.calendarPresetChanged("month");
      } else if (sd === lastMonth.sd && ed === lastMonth.ed) {
        this.calendarPresetChanged("last_month");
      } else if (sd === quarter.sd && ed === quarter.ed) {
        this.calendarPresetChanged("kv");
      } else if (sd === year.sd && ed === year.ed) {
        this.calendarPresetChanged("year");
      }
    },
    formatDateYMD(date) {
      return date.setHours(0, 0, 0, 0);
    },
    setTime(time) {
      let t = time.split(":");

      if (!this.sd) {
        this.sd = new Date();
      }

      this.sd.setHours(t[0], t[1], 0, 0);
      this.sd = new Date(this.sd);
      this.$emit("changed", { sd: this.sd, ed: this.ed });
    },
    toHHmm(d) {
      if (d) {
        let h = d.getHours();
        h = h < 10 ? `0${h}` : `${h}`;
        let m = d.getMinutes();
        m = m < 10 ? `0${m}` : `${m}`;
        return `${h}:${m}`;
      } else return "";
    },
    regist_cal() {
      pickmeup.defaults.locales["ru"] = {
        days: [
          "Воскресенье",
          "Понедельник",
          "Вторник",
          "Среда",
          "Четверг",
          "Пятница",
          "Суббота"
        ],
        daysShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        daysMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        months: [
          "Январь",
          "Февраль",
          "Март",
          "Апрель",
          "Май",
          "Июнь",
          "Июль",
          "Август",
          "Сентябрь",
          "Октябрь",
          "Ноябрь",
          "Декабрь"
        ],
        monthsShort: [
          "Янв",
          "Фев",
          "Мар",
          "Апр",
          "Май",
          "Июн",
          "Июл",
          "Авг",
          "Сен",
          "Окт",
          "Ноя",
          "Дек"
        ]
      };

      pickmeup(".ini_calendar", {
        flat: true,
        /* date      : [
                    this.sd,
                    this.ed
                ],*/
        date: this.mode === "single" && this.sd !== "" ? this.sd : undefined,
        prev: '<div class="calendar-control calendar-control_prev"></div>',
        next: '<div class="calendar-control calendar-control_next"></div>',
        mode: this.mode,
        calendars: this.calendars,
        locale: "ru",
        title_format: "B Y",
        render: function(date) {
          if (this.mode === "range") {
            if (
              this.sd.toString() === date.toString() ||
              this.ed.toString() === date.toString()
            ) {
              return { class_name: "marked_date" };
            }
            return { class_name: "" };
          }
          if (this.mode === "single" && this.sd !== "") {
            return {
              class_name:
                this.sd.getFullYear() === date.getFullYear() &&
                this.sd.getMonth() === date.getMonth() &&
                this.sd.getDate() === date.getDate()
                  ? "marked_date"
                  : ""
            };
          }
        }.bind(this)
      });
      this.$el
        .querySelector(".ini_calendar")
        .addEventListener("pickmeup-change", e => {
          if (this.mode === "range") {
            this.sd = e.detail.date[0];
            this.ed = e.detail.date[1];

            let ssd = e.detail.formatted_date[0]
              .split("-")
              .reverse()
              .join("-");
            let sed = e.detail.formatted_date[1]
              .split("-")
              .reverse()
              .join("-");

            pickmeup(".ini_calendar").update();
            this.$emit("changed", { sd: ssd, ed: sed });
          }
          if (this.mode === "single") {
            let d = e.detail.date;
            if (this.sd === "") this.sd = d;
            this.sd.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
            let ssd = e.detail.formatted_date
              .split("-")
              .reverse()
              .join("-");

            this.$emit("changed", {
              sd: this.sd,
              ed: this.ed,
              formated_sd: ssd,
              formated_ed: ssd
            });
          }
        });
    },

    calendarPresetChanged(id) {
      this.calendarPresets.forEach(preset => {
        preset.checked = preset.id === id && id !== "all_time";
      });

      this.preset(id);
    },

    setDateFromProps() {
      if (this.sdate === "") {
        this.sd = "";
      } else {
        this.sd = new Date(this.sdate);
        let hours = "0";
        let minutes = "0";

        if (this.stime) {
          [hours, minutes] = this.stime.split(":");
        }

        this.$nextTick(() => {
          this.sd = new Date(this.sd.setHours(hours, minutes, 0, 0));
        });
      }

      if (this.edate === "") {
        this.ed = "";
      } else {
        this.ed = new Date(this.edate);
        this.ed.setHours(0, 0, 0, 0);
      }
    }
  },

  watch: {
    setPeriodToToday(isSet) {
      if (isSet) {
        this.sd = new Date(new Date(this.startDate).setHours(0, 0, 0, 0));
        this.ed = new Date(new Date().setHours(0, 0, 0, 0));
        const sdEmit = this.sd.toISOString().slice(0, 10);
        const edEmit = this.ed.toISOString().slice(0, 10);
        pickmeup(".ini_calendar").update();
        this.$emit("changed", { sd: sdEmit, ed: edEmit });
      }
    }
  },

  mounted() {
    this.setDateFromProps();

    if (this.mode === "single") {
      if (this.sdate !== "") {
        this.sd = new Date(this.sdate);
        this.sd.setHours(
          this.sd.getHours(),
          this.sd.getMinutes() < 30 ? 0 : 30,
          0,
          0
        );
        let el = this.$el.querySelectorAll(".timepicker__item");
        if (this.showTimePicker) {
          this.times.forEach((i, index) => {
            if (
              i[0] === this.toHHmm(this.sd) ||
              i[1] === this.toHHmm(this.sd)
            ) {
              if (el[index] !== undefined) {
                el[index].scrollIntoView();
              }
            }
          });
        }
      }

      this.$emit("changed", { sd: this.sd, ed: this.ed });
      this.$emit("mounted");
    }
    //this.sd.setHours(0,0,0,0);
    //this.ed.setHours(0,0,0,0);

    this.regist_cal();
    pickmeup(".ini_calendar").set_date([this.sd, this.ed]);
    pickmeup(".ini_calendar").update();

    if (this.showPresetsSelect) {
      this.presetFromProps();
    }
  },
  destroyed() {
    this.$emit("destroyed");
  }
});
