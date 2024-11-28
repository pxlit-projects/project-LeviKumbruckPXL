package be.pxl.services.client;

import be.pxl.services.domain.ReviewRequest;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ReviewClient {

    private final RabbitTemplate rabbitTemplate;

    @Autowired
    public ReviewClient(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendPostForReview(ReviewRequest reviewRequest) {
        rabbitTemplate.convertAndSend("reviewQueue", reviewRequest);
    }
}



