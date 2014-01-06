#! /bin/bash
### BEGIN INIT INFO
# Provides:          thoth
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Thoth initscript
# Description:       
### END INIT INFO

# Author: William Petit <william.petit@ac-dijon.fr>

# Do NOT "set -e"

USER=www-data
GROUP=www-data
LOG=/var/log/thoth/thoth.log
NODE_ENV=production
APP_ROOT="/var/node/thoth"
NODE_BIN=/usr/bin/node

# PATH should only include /usr/* if it runs after the mountnfs.sh script
PATH=/sbin:/usr/sbin:/bin:/usr/bin
DESC="Password storage application"
NAME="thoth"
SCRIPT="$NODE_BIN $APP_ROOT/app.js"
SCRIPT_ARGS=""
PIDFILE=/var/run/$NAME.pid
SCRIPT_NAME=/etc/init.d/thoth

# Load the VERBOSE setting and other rcS variables
. /lib/init/vars.sh

# Define LSB log_* functions.
# Depend on lsb-base (>= 3.2-14) to ensure that this file is present
# and status_of_proc is working.
. /lib/lsb/init-functions

#
# Function that starts the daemon/service
#
do_start()
{	
	LOG_DIR="$(dirname $LOG)"
	mkdir -p "$LOG_DIR"
	chown -R $USER:$GROUP "$LOG_DIR"
	echo
	read -s -p "Enter passphrase: " PASSPHRASE
	start-stop-daemon --start -q -d $APP_ROOT -p $PIDFILE --exec $SCRIPT --test > /dev/null \
		|| return 1
	NODE_ENV=$NODE_ENV encryption__passphrase="$PASSPHRASE" start-stop-daemon --start -c $USER -b -q -m -d $APP_ROOT -p $PIDFILE --exec /bin/bash -- \
		-c "exec $SCRIPT $SCRIPT_ARGS >> $LOG 2>&1" \
		|| return 2
}

#
# Function that stops the daemon/service
#
do_stop()
{
	# Return
	#   0 if daemon has been stopped
	#   1 if daemon was already stopped
	#   2 if daemon could not be stopped
	#   other if a failure occurred
	start-stop-daemon --stop --signal INT --quiet --retry=INT/30/KILL/5 -p $PIDFILE
	RETVAL="$?"
	[ "$RETVAL" = 2 ] && return 2
	start-stop-daemon --stop --signal INT --quiet --oknodo --retry=0/30/KILL/5 --exec $SCRIPT
	[ "$?" = 2 ] && return 2
	rm -f $PIDFILE
	return "$RETVAL"
}

case "$1" in
  start)
	[ "$VERBOSE" != no ] && log_daemon_msg "Starting $DESC" "$NAME"
	do_start
	case "$?" in
		0|1) [ "$VERBOSE" != no ] && log_end_msg 0 ;;
		2) [ "$VERBOSE" != no ] && log_end_msg 1 ;;
	esac
	;;
  stop)
	[ "$VERBOSE" != no ] && log_daemon_msg "Stopping $DESC" "$NAME"
	do_stop
	case "$?" in
		0|1) [ "$VERBOSE" != no ] && log_end_msg 0 ;;
		2) [ "$VERBOSE" != no ] && log_end_msg 1 ;;
	esac
	;;
  status)
       status_of_proc "$DAEMON" "$NAME" && exit 0 || exit $?
       ;;
  restart|force-reload)
	#
	# If the "reload" option is implemented then remove the
	# 'force-reload' alias
	#
	log_daemon_msg "Restarting $DESC" "$NAME"
	do_stop
	case "$?" in
	  0|1)
		do_start
		case "$?" in
			0) log_end_msg 0 ;;
			1) log_end_msg 1 ;; # Old process is still running
			*) log_end_msg 1 ;; # Failed to start
		esac
		;;
	  *)
	  	# Failed to stop
		log_end_msg 1
		;;
	esac
	;;
  *)
	#echo "Usage: $SCRIPT_NAME {start|stop|restart|reload|force-reload}" >&2
	echo "Usage: $SCRIPT_NAME {start|stop|status|restart|force-reload}" >&2
	exit 3
	;;
esac

:
