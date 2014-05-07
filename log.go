// +build log

package main

import (
	"log"
	"os"
	"os/user"
	"path"
)

func init() {
	usr, e := user.Current()
	if e != nil {
		panic(e)
	}
	home := usr.HomeDir
	f, err := os.OpenFile(path.Join(home, "multipass_log.txt"), os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		panic(err)
	}
	log.SetOutput(f)
}
