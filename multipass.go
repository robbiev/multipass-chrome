package main

import (
	"encoding/binary"
	"encoding/json"
	"log"
	"os"
	"os/user"
	"path"

	"github.com/robbiev/multipass"
)

type KeychainResponse struct {
	Success bool
	Items   []multipass.Item
}

func getKeychain(password []byte) KeychainResponse {
	usr, err := user.Current()
	if err != nil {
		log.Println(err)
		return KeychainResponse{Success: false}
	}
	home := usr.HomeDir
	onePasswordDir := path.Join(home, "/Dropbox/1password/1Password.agilekeychain/data/default")
	keyChain := multipass.NewAgileKeyChain(onePasswordDir)
	defer keyChain.Close()
	err = keyChain.Open(password)
	response := KeychainResponse{Success: err == nil}
	if err == nil {
		var items []multipass.Item
		keyChain.ForEachItem(func(p string, f []byte) error {
			item, err := multipass.DecryptFile(f, keyChain.Keys())
			if err == nil {
				items = append(items, item)
			}
			return nil
		})
		response.Items = items
	}
	return response
}

func main() {
	defer func() {
		if r := recover(); r != nil {
			log.Println("Recovered in f", r)
		}
	}()

	for {
		// get message length, 4 bytes
		var length uint32
		err := binary.Read(os.Stdin, binary.LittleEndian, &length)
		if err != nil {
			break
		}

		// read message
		message := make([]byte, length)
		_, err = os.Stdin.Read(message)
		if err != nil {
			break
		}

		log.Println("read message")

		type Command struct {
			Action  string
			Payload interface{}
		}

		var command Command
		json.Unmarshal(message, &command)
		payload := command.Payload.(map[string]interface{})

		// there's only one message type right now
		password := []byte(payload["Password"].(string))
		response := getKeychain(password)

		encoded, _ := json.Marshal(response)
		binary.Write(os.Stdout, binary.LittleEndian, uint32(len(encoded)))
		_, err = os.Stdout.Write(encoded)
		if err != nil {
			log.Println(err)
			break
		}
	}
}
