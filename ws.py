from twisted.internet.defer import Deferred
from twisted.internet.task import react
from txws import WebSocketFactory
from twisted.internet.protocol import Factory, Protocol

@Factory.forProtocol
class WS(Protocol):
    def connectionMade(self):
        self.factory.protocols.add(self)

    def connectionLost(self, reason):
        self.factory.protocols.remove(self)

    def dataReceived(self, data):
        for proto in self.factory.protocols:
            if proto is not self:
                proto.transport.write(data)

WS.protocols = set()
@react
def main(reactor):
    reactor.listenTCP(5001, WebSocketFactory(WS))
    return Deferred()