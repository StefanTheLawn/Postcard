//
//  ViewController.swift
//  Postcard
//
//  Created by Stefan on 2014-09-15.
//  Copyright (c) 2014 JezamInteractive. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    @IBOutlet weak var messageLabel: UILabel!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var enterNameTextField: UITextField!
    @IBOutlet weak var enterMessageTextField: UITextField!
    @IBOutlet weak var mailButton: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    @IBAction func sendMailButtonPressed(sender: UIButton) {
        //code will evaluate when button pressed
        //here is a new comment
        messageLabel.hidden = false;
        messageLabel.text = enterMessageTextField.text;
        enterMessageTextField.text = "";
        enterMessageTextField.resignFirstResponder();
        messageLabel.textColor = UIColor.blueColor();
        mailButton.setTitle("Sent Mail", forState: UIControlState.Normal);
        
        nameLabel.hidden = false;
        nameLabel.text = enterNameTextField.text;
        enterNameTextField.text = "";
        enterNameTextField.resignFirstResponder();
        nameLabel.textColor = UIColor.purpleColor();
    }

}

